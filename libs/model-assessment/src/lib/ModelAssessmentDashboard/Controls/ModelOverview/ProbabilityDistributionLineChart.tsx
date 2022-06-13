// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BasicHighChart,
  calculateLinePlotDataFromErrorCohort,
  defaultModelAssessmentContext,
  ErrorCohort,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { getTheme, IChoiceGroupOption } from "office-ui-fabric-react";
import React from "react";

interface IProbabilityDistributionLineChartProps {
  selectedCohorts: ErrorCohort[];
  probabilityOption?: IChoiceGroupOption;
}

class IProbabilityDistributionLineChartState {}

export class ProbabilityDistributionLineChart extends React.Component<
  IProbabilityDistributionLineChartProps,
  IProbabilityDistributionLineChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const theme = getTheme();

    const linePlotData = this.props.selectedCohorts.map((cohort) => {
      return calculateLinePlotDataFromErrorCohort(
        cohort,
        this.props.probabilityOption!.key.toString()
      )!; // TODO: handle undefined case
    });

    return (
      <BasicHighChart
        id={"ProbabilityDistributionLineChart"}
        theme={theme}
        configOverride={{
          chart: {
            type: "line"
          },
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: true
              }
            }
          },
          legend: {
            layout: "vertical",
            align: "right",
            verticalAlign: "middle",
            enabled: true
          },
          series: linePlotData.map((lineData, index) => {
            return {
              data: lineData.map((probBinCount) => probBinCount.binCount),
              name: this.props.selectedCohorts[index].cohort.name,
              type: "line"
            };
          }),
          xAxis: {
            categories: linePlotData.map((lineData) =>
              lineData.map((probBinCount) => probBinCount.binName)
            )[0],
            title: { text: this.props.probabilityOption!.text }
          },
          yAxis: {
            title: {
              text: localization.ModelAssessment.ModelOverview.countAxisLabel
            }
          }
        }}
      />
    );
  }
}
