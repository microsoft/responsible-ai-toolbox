// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BasicHighChart,
  calculateBoxPlotDataFromErrorCohort,
  defaultModelAssessmentContext,
  ErrorCohort,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { PointOptionsObject } from "highcharts";
import { getTheme, IChoiceGroupOption } from "office-ui-fabric-react";
import React from "react";

interface IProbabilityDistributionBoxChartProps {
  selectedCohorts: ErrorCohort[];
  probabilityOption?: IChoiceGroupOption;
}

class IProbabilityDistributionBoxChartState {}

export class ProbabilityDistributionBoxChart extends React.Component<
  IProbabilityDistributionBoxChartProps,
  IProbabilityDistributionBoxChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  constructor(props: IProbabilityDistributionBoxChartProps) {
    super(props);
    this.state = { probabilityFlyoutIsVisible: false, showLineChart: false };
  }

  public render(): React.ReactNode {
    const theme = getTheme();

    const selectedCohortNames = this.props.selectedCohorts.map(
      (cohort) => cohort.cohort.name
    );

    const boxPlotData = this.props.selectedCohorts.map((cohort, index) => {
      return calculateBoxPlotDataFromErrorCohort(
        cohort,
        index,
        this.props.probabilityOption!.key.toString()
      );
    });
    const outlierData = boxPlotData
      .map((cohortBoxPlotData) => cohortBoxPlotData?.outliers)
      .map((outlierProbs, cohortIndex) => {
        return outlierProbs?.map((prob) => [cohortIndex, prob]);
      })
      .filter((list) => list !== undefined)
      .reduce((list1, list2) => list1!.concat(list2!), []);

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
              data: boxPlotData.map((boxData) => boxData as PointOptionsObject),
              fillColor: "#b2d6f2",
              name: localization.ModelAssessment.ModelOverview.BoxPlot
                .boxPlotSeriesLabel,
              type: "boxplot"
            },
            {
              data: outlierData,
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
}
