// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, IChoiceGroupOption } from "@fluentui/react";
import {
  BasicHighChart,
  boxChartTooltipDefaultSetting,
  calculateBoxPlotDataFromErrorCohort,
  defaultModelAssessmentContext,
  ErrorCohort,
  ModelAssessmentContext,
  setOutlierDataIfChanged,
  IBoxChartState,
  ifEnableLargeData
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { PointOptionsObject } from "highcharts";
import _ from "lodash";
import React from "react";

interface IProbabilityDistributionBoxChartProps {
  boxPlotState: IBoxChartState;
  selectedCohorts: ErrorCohort[];
  probabilityOption?: IChoiceGroupOption;
  onBoxPlotStateUpdate: (boxPlotState: IBoxChartState) => void;
}

export class ProbabilityDistributionBoxChart extends React.Component<IProbabilityDistributionBoxChartProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public componentDidUpdate(
    prevProps: IProbabilityDistributionBoxChartProps
  ): void {
    if (
      this.props.boxPlotState.boxPlotData.length === 0 ||
      !_.isEqual(prevProps.selectedCohorts, this.props.selectedCohorts) ||
      !_.isEqual(
        prevProps.probabilityOption?.id,
        this.props.probabilityOption?.id
      )
    ) {
      const boxPlotData = this.props.selectedCohorts.map(
        (cohort: ErrorCohort, index: number) => {
          return calculateBoxPlotDataFromErrorCohort(
            cohort,
            index,
            this.props.probabilityOption?.key || "",
            this.props.probabilityOption?.id,
            this.context.requestBoxPlotDistribution,
            ifEnableLargeData(this.context.dataset)
          );
        }
      );
      setOutlierDataIfChanged(
        boxPlotData,
        this.props.boxPlotState,
        this.props.onBoxPlotStateUpdate
      );
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
              data: this.props.boxPlotState.boxPlotData.map(
                (boxData) => boxData as PointOptionsObject
              ),
              fillColor: theme.semanticColors.inputBackgroundChecked,
              name: localization.ModelAssessment.ModelOverview.BoxPlot
                .boxPlotSeriesLabel,
              tooltip: boxChartTooltipDefaultSetting,
              type: "boxplot"
            },
            {
              data: this.props.boxPlotState.outlierData,
              name: localization.ModelAssessment.ModelOverview.BoxPlot
                .outlierLabel,
              tooltip: {
                pointFormatter(): string {
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
            title: { text: this.props.probabilityOption?.text }
          }
        }}
      />
    );
  }
}
