// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, IChoiceGroupOption } from "@fluentui/react";
import {
  BasicHighChart,
  calculateBoxPlotDataFromErrorCohort,
  defaultModelAssessmentContext,
  ErrorCohort,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { PointOptionsObject } from "highcharts";
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

  public render(): React.ReactNode {
    const theme = getTheme();
    console.log("okok selectedCohorts", this.props.selectedCohorts);
    console.log("okok selectedCohorts1", this.props.selectedCohorts);
    const selectedCohortNames = this.props.selectedCohorts.map(
      (cohort) => cohort.cohort.name
    );

    const boxPlotData = this.props.selectedCohorts.map(
      (cohort: ErrorCohort, index: number) => {
        // we need a flag:boolean to differentiate if it is over 5k.
        if (this.context.requestBoxPlotDistribution) {
          const key = this.props.probabilityOption!.key.toString();
          // const data = cohort.cohort.filteredData.map((dict) => dict[key]);
          const data = {
            compositeFilters: cohort.cohort.compositeFilters,
            filters: cohort.cohort.filters,
            queryClass: key
          };
          console.log(
            "okok prob distribution box plot:",
            this.context.requestBoxPlotDistribution,
            this.context,
            "key",
            key
          );
          const result = this.context.requestBoxPlotDistribution?.(
            data,
            new AbortController().signal
          );
          console.log("okok result:", result);
        }
        return calculateBoxPlotDataFromErrorCohort(
          cohort,
          index,
          this.props.probabilityOption!.key.toString()
        );
      }
    );
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
              fillColor: theme.semanticColors.inputBackgroundChecked,
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
