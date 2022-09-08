// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, IChoiceGroupOption } from "@fluentui/react";
import {
  BasicHighChart,
  calculateBoxPlotData,
  calculateBoxPlotDataFromErrorCohort,
  defaultModelAssessmentContext,
  ErrorCohort,
  IHighchartBoxData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { PointOptionsObject } from "highcharts";
import _ from "lodash";
import React from "react";

import { isFlightActive, newSdkEndpointsFlight } from "../../FeatureFlights";

interface IProbabilityDistributionBoxChartProps {
  boxPlotState: IProbabilityDistributionBoxChartState;
  selectedCohorts: ErrorCohort[];
  probabilityOption?: IChoiceGroupOption;
  onBoxPlotStateUpdate: (
    boxPlotState: IProbabilityDistributionBoxChartState
  ) => void;
}

export interface IProbabilityDistributionBoxChartState {
  boxPlotData: Array<IHighchartBoxData | undefined>;
  outlierData: number[][] | undefined;
}

export class ProbabilityDistributionBoxChart extends React.Component<IProbabilityDistributionBoxChartProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public componentDidUpdate(
    prevProps: IProbabilityDistributionBoxChartProps
  ): void {
    if (isFlightActive(newSdkEndpointsFlight, this.context.featureFlights)) {
      if (
        this.props.boxPlotState.boxPlotData.length === 0 ||
        !_.isEqual(prevProps.selectedCohorts, this.props.selectedCohorts) ||
        !_.isEqual(
          prevProps.probabilityOption!.id,
          this.props.probabilityOption!.id
        )
      ) {
        const boxPlotData = this.props.selectedCohorts.map(
          (cohort: ErrorCohort, index: number) => {
            return calculateBoxPlotDataFromErrorCohort(
              cohort,
              index,
              this.props.probabilityOption!.key.toString(),
              this.props.probabilityOption!.id,
              this.context.requestBoxPlotDistribution
            );
          }
        );
        this.getOutlierData(boxPlotData);
      }
    }
  }

  public render(): React.ReactNode {
    const theme = getTheme();
    const selectedCohortNames = this.props.selectedCohorts.map(
      (cohort) => cohort.cohort.name
    );

    const isNewSdkEndpointsFlightOn = isFlightActive(
      newSdkEndpointsFlight,
      this.context.featureFlights
    );
    let boxPlotData;
    let outlierData;
    if (!isNewSdkEndpointsFlightOn) {
      boxPlotData = this.props.selectedCohorts.map((cohort, index) => {
        return calculateBoxPlotData(
          cohort.cohort.filteredData.map(
            (dict) => dict[this.props.probabilityOption!.key.toString()]
          ),
          index
        );
      });
      outlierData = boxPlotData
        .map((cohortBoxPlotData) => cohortBoxPlotData?.outliers)
        .map((outlierProbs, cohortIndex) => {
          return outlierProbs?.map((prob) => [cohortIndex, prob]);
        })
        .filter((list) => list !== undefined)
        .reduce((list1, list2) => list1!.concat(list2!), []);
    }

    return (
      <BasicHighChart
        id={"ProbabilityDistributionBoxChart"}
        theme={theme}
        configOverride={{
          chart: {
            height: this.props.selectedCohorts.length * 40 + 120,
            inverted: true,
            type: "boxplot"
          },
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: true
              }
            }
          },
          series: [
            {
              data: isNewSdkEndpointsFlightOn
                ? this.props.boxPlotState.boxPlotData.map(
                    (boxData) => boxData as PointOptionsObject
                  )
                : boxPlotData?.map((boxData) => boxData as PointOptionsObject),
              fillColor: theme.semanticColors.inputBackgroundChecked,
              name: localization.ModelAssessment.ModelOverview.BoxPlot
                .boxPlotSeriesLabel,
              type: "boxplot"
            },
            {
              data: isNewSdkEndpointsFlightOn
                ? this.props.boxPlotState.outlierData
                : outlierData,
              name: localization.ModelAssessment.ModelOverview.BoxPlot
                .outlierLabel,
              tooltip: {
                pointFormatter() {
                  return `${localization.ModelAssessment.ModelOverview.BoxPlot.outlierProbability}: <b>${this.y}</b>`;
                }
              },
              type: "scatter"
            }
          ],
          xAxis: {
            categories: selectedCohortNames
          },
          yAxis: {
            title: { text: this.props.probabilityOption!.text }
          }
        }}
      />
    );
  }

  private async getOutlierData(
    boxPlotData: Array<Promise<IHighchartBoxData | undefined>>
  ): Promise<void> {
    const data = await Promise.all(boxPlotData);
    const outlierData = data
      .map((cohortBoxPlotData) => cohortBoxPlotData?.outliers)
      .map((outlierProbs, cohortIndex) => {
        return outlierProbs?.map((prob) => [cohortIndex, prob]);
      })
      .filter((list) => list !== undefined)
      .reduce((list1, list2) => list1!.concat(list2!), []);
    if (
      !_.isEqual(data, this.props.boxPlotState.boxPlotData) ||
      !_.isEqual(this.props.boxPlotState.outlierData, outlierData)
    ) {
      this.props.onBoxPlotStateUpdate({ boxPlotData: data, outlierData });
    }
  }
}
