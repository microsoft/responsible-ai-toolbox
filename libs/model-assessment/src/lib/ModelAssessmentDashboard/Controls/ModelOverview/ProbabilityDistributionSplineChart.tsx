// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, IChoiceGroupOption } from "@fluentui/react";
import {
  BasicHighChart,
  calculateSplinePlotDataFromErrorCohort,
  defaultModelAssessmentContext,
  ErrorCohort,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

interface IProbabilityDistributionSplineChartProps {
  selectedCohorts: ErrorCohort[];
  probabilityOption?: IChoiceGroupOption;
}

class IProbabilityDistributionSplineChartState {}

export class ProbabilityDistributionSplineChart extends React.Component<
  IProbabilityDistributionSplineChartProps,
  IProbabilityDistributionSplineChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const theme = getTheme();
    const splinePlotData = this.props.selectedCohorts.map((cohort) => {
      return calculateSplinePlotDataFromErrorCohort(
        cohort,
        this.props.probabilityOption?.key
      ); // TODO: handle undefined case
    });

    return (
      <BasicHighChart
        id={"ProbabilityDistributionSplineChart"}
        theme={theme}
        configOverride={{
          chart: {
            type: "spline"
          },
          legend: {
            align: "right",
            enabled: true,
            layout: "vertical",
            verticalAlign: "middle"
          },
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: true
              }
            }
          },
          series: splinePlotData.map((splineData, index) => {
            return {
              data: splineData?.map(
                (probBinCount: { binCount: any }) => probBinCount.binCount
              ),
              name: this.props.selectedCohorts[index].cohort.name,
              type: "spline"
            };
          }),
          xAxis: {
            categories: splinePlotData.map((splineData) =>
              splineData?.map(
                (probBinCount: { binName: any }) => probBinCount.binName
              )
            )[0],
            title: { text: this.props.probabilityOption?.text }
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
