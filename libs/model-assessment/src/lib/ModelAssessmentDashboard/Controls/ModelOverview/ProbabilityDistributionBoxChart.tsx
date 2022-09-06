// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, IChoiceGroupOption } from "@fluentui/react";
import {
  BasicHighChart,
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

interface IProbabilityDistributionBoxChartProps {
  selectedCohorts: ErrorCohort[];
  probabilityOption?: IChoiceGroupOption;
}

interface IProbabilityDistributionBoxChartState {
  boxPlotData: Array<IHighchartBoxData | undefined>;
  outlierData: number[][] | undefined;
}

export class ProbabilityDistributionBoxChart extends React.Component<
  IProbabilityDistributionBoxChartProps,
  IProbabilityDistributionBoxChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: IProbabilityDistributionBoxChartProps) {
    super(props);
    this.state = {
      boxPlotData: [],
      outlierData: undefined
    };
  }

  public componentDidUpdate(
    prevProps: IProbabilityDistributionBoxChartProps
  ): void {
    if (
      this.state.boxPlotData.length === 0 ||
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

  public render(): React.ReactNode {
    const theme = getTheme();
    const selectedCohortNames = this.props.selectedCohorts.map(
      (cohort) => cohort.cohort.name
    );

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
              data: this.state.boxPlotData.map(
                (boxData) => boxData as PointOptionsObject
              ),
              fillColor: theme.semanticColors.inputBackgroundChecked,
              name: localization.ModelAssessment.ModelOverview.BoxPlot
                .boxPlotSeriesLabel,
              type: "boxplot"
            },
            {
              data: this.state.outlierData,
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
    if (data !== this.state.boxPlotData) {
      this.setState({ boxPlotData: data });
    }
    const outlierData = data
      .map((cohortBoxPlotData) => cohortBoxPlotData?.outliers)
      .map((outlierProbs, cohortIndex) => {
        return outlierProbs?.map((prob) => [cohortIndex, prob]);
      })
      .filter((list) => list !== undefined)
      .reduce((list1, list2) => list1!.concat(list2!), []);
    if (_.isEqual(this.state.outlierData, outlierData)) {
      this.setState({ outlierData });
    }
  }
}
