// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import { Transform } from "plotly.js";

import { Cohort } from "../Cohort/Cohort";
import { cohortKey } from "../cohortKey";
import { IModelAssessmentContext } from "../Context/ModelAssessmentContext";
import { getPrimaryChartColor } from "../Highchart/ChartColors";
import { ModelTypes } from "../Interfaces/IExplanationContext";
import { ILabeledStatistic } from "../Interfaces/IStatistic";
import { IsBinary } from "../util/ExplanationUtils";
import { FluentUIStyles } from "../util/FluentUIStyles";
import { ChartTypes, IGenericChartProps } from "../util/IGenericChartProps";
import { JointDataset } from "../util/JointDataset";
import { generateMetrics } from "../util/StatisticsUtils";

export function generatePlotlyProps(
  jointData: JointDataset,
  chartProps: IGenericChartProps,
  cohorts: Cohort[],
  selectedCohortIndex: number
): IPlotlyProperty {
  // In this view, y will always be categorical (including a binned numeric variable), and could be
  // iterations over the cohorts. We can set y and the y labels before the rest of the char properties.
  const plotlyProps: IPlotlyProperty = {
    config: { displaylogo: false, displayModeBar: false, responsive: true },
    data: [{}],
    layout: {
      autosize: true,
      dragmode: false,
      hovermode: "closest",
      margin: {
        b: 20,
        l: 10,
        t: 25
      },
      showlegend: false,
      xaxis: {
        color: FluentUIStyles.chartAxisColor,
        gridcolor: "#e5e5e5",
        mirror: true,
        showgrid: true,
        showline: true,
        side: "bottom",
        tickfont: {
          family: FluentUIStyles.fontFamilies,
          size: 11
        }
      },
      yaxis: {
        automargin: true,
        color: FluentUIStyles.chartAxisColor,
        showline: true,
        tickfont: {
          family: FluentUIStyles.fontFamilies,
          size: 11
        }
      }
    } as any
  };
  let rawX: number[];
  let rawY: number[];
  let yLabels: string[] | undefined;
  let yLabelIndexes: number[] | undefined;
  const yMeta = jointData.metaDict[chartProps.yAxis.property];
  const yAxisName = yMeta.label;
  if (chartProps.yAxis.property === cohortKey) {
    rawX = [];
    rawY = [];
    yLabels = [];
    yLabelIndexes = [];
    cohorts.forEach((cohort, cohortIndex) => {
      const cohortXs = cohort.unwrap(
        chartProps.xAxis.property,
        chartProps.chartType === ChartTypes.Histogram
      );
      const cohortY = new Array(cohortXs.length).fill(cohortIndex);
      rawX.push(...cohortXs);
      rawY.push(...cohortY);
      yLabels?.push(cohort.name);
      yLabelIndexes?.push(cohortIndex);
    });
  } else {
    const cohort = cohorts[selectedCohortIndex];
    rawY = cohort.unwrap(chartProps.yAxis.property, true);
    rawX = cohort.unwrap(
      chartProps.xAxis.property,
      chartProps.chartType === ChartTypes.Histogram
    );
    yLabels = yMeta.sortedCategoricalValues;
    yLabelIndexes = yLabels?.map((_, index) => index);
  }

  // The bounding box for the labels on y axis are too small, add some white space as buffer
  yLabels = yLabels?.map((val) => {
    const len = val.length;
    let result = " ";
    for (let i = 0; i < len; i += 5) {
      result += " ";
    }
    return result + val;
  });
  plotlyProps.data[0].hoverinfo = "all";
  plotlyProps.data[0].orientation = "h";
  switch (chartProps.chartType) {
    case ChartTypes.Box: {
      // Uncomment to turn off tooltips on box plots
      // plotlyProps.layout.hovermode = false;
      plotlyProps.data[0].type = "box" as any;
      plotlyProps.data[0].x = rawX;
      plotlyProps.data[0].y = rawY;
      plotlyProps.data[0].marker = {
        color: getPrimaryChartColor(getTheme())
      };
      _.set(plotlyProps, "layout.yaxis.ticktext", yLabels);
      _.set(plotlyProps, "layout.yaxis.tickvals", yLabelIndexes);
      break;
    }
    case ChartTypes.Histogram: {
      // for now, treat all bar charts as histograms, the issue with plotly implemented histogram is
      // it tries to bin the data passed to it(we'd like to apply the user specified bins.)
      // We also use the selected Y property as the series prop, since all histograms will just be a count.
      plotlyProps.data[0].type = "bar";
      const x = new Array(rawY.length).fill(1);
      plotlyProps.data[0].text = rawY.map((index) => yLabels?.[index] || "");
      plotlyProps.data[0].hoverinfo = "all";
      plotlyProps.data[0].hovertemplate = ` ${yAxisName}:%{y}<br> ${localization.Interpret.Charts.count}: %{x}<br>`;
      plotlyProps.data[0].y = rawY;
      plotlyProps.data[0].x = x;
      plotlyProps.data[0].marker = {};
      _.set(plotlyProps, "layout.yaxis.ticktext", yLabels);
      _.set(plotlyProps, "layout.yaxis.tickvals", yLabelIndexes);
      const styles = jointData.metaDict[
        chartProps.xAxis.property
      ].sortedCategoricalValues?.map((label, index) => {
        return {
          target: index,
          value: {
            marker: {
              color: FluentUIStyles.fluentUIColorPalette[index]
            },
            name: label
          }
        };
      });
      const transforms: Array<Partial<Transform>> = [
        {
          aggregations: [{ func: "sum", target: "x" }],
          groups: rawY,
          type: "aggregate"
        },
        {
          groups: rawX,
          styles,
          type: "groupby"
        }
      ];
      if (plotlyProps.layout) {
        plotlyProps.layout.showlegend = true;
      }
      plotlyProps.data[0].transforms = transforms;
      break;
    }
    default:
  }
  return plotlyProps;
}

export function generateDefaultChartAxes(
  context: IModelAssessmentContext
): IGenericChartProps | undefined {
  if (!context.jointDataset.hasPredictedY) {
    return undefined;
  }
  let bestModelMetricKey: string;
  if (
    IsBinary(context.modelMetadata.modelType) &&
    context.jointDataset.hasPredictedProbabilities
  ) {
    bestModelMetricKey = `${JointDataset.ProbabilityYRoot}0`;
  } else if (context.modelMetadata.modelType === ModelTypes.Regression) {
    if (context.jointDataset.hasPredictedY && context.jointDataset.hasTrueY) {
      bestModelMetricKey = JointDataset.RegressionError;
    } else {
      bestModelMetricKey = JointDataset.PredictedYLabel;
    }
  } else {
    bestModelMetricKey = JointDataset.PredictedYLabel;
  } // not handling multiclass at this time

  const chartProps: IGenericChartProps = {
    chartType: context.jointDataset.metaDict[bestModelMetricKey].isCategorical
      ? ChartTypes.Histogram
      : ChartTypes.Box,
    xAxis: {
      options: {
        bin: false
      },
      property: bestModelMetricKey
    },
    yAxis: {
      options: {},
      property: cohortKey
    }
  };
  return chartProps;
}

export function generateMetricsList(
  context: IModelAssessmentContext,
  selectedCohortIndex: number,
  yAxisProperty: string,
  chartProps?: IGenericChartProps
): ILabeledStatistic[][] {
  if (!chartProps) {
    return [];
  }
  if (chartProps.yAxis.property === cohortKey) {
    const indexes = context.errorCohorts.map((errorCohort) =>
      errorCohort.cohort.unwrap(JointDataset.IndexLabel)
    );
    return generateMetrics(
      context.jointDataset,
      indexes,
      context.modelMetadata.modelType
    );
  }
  const cohort = context.errorCohorts[selectedCohortIndex].cohort;
  const yValues = cohort.unwrap(yAxisProperty, true);
  const indexArray = cohort.unwrap(JointDataset.IndexLabel);
  const sortedCategoricalValues =
    context.jointDataset.metaDict[yAxisProperty].sortedCategoricalValues;
  const indexes = sortedCategoricalValues?.map((_, labelIndex) => {
    return indexArray.filter((_, index) => {
      return yValues[index] === labelIndex;
    });
  });
  return generateMetrics(
    context.jointDataset,
    indexes || [],
    context.modelMetadata.modelType
  );
}
