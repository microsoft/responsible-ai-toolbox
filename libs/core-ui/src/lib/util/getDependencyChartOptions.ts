// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { Dictionary } from "lodash";

import { Cohort } from "../Cohort/Cohort";
import { IHighchartsConfig } from "../Highchart/HighchartTypes";

import { IGenericChartProps } from "./IGenericChartProps";
import { JointDataset } from "./JointDataset";

export function getDependencyChartOptions(
  chartProps: IGenericChartProps,
  jointDataset: JointDataset,
  cohort: Cohort,
  theme?: ITheme
): IHighchartsConfig {
  const colorTheme = {
    axisColor: theme?.palette.neutralPrimary,
    axisGridColor: theme?.palette.neutralLight,
    backgroundColor: theme?.palette.white,
    fontColor: theme?.semanticColors.bodyText
  };
  let hoverTemplate = "";
  if (
    chartProps.colorAxis &&
    (chartProps.colorAxis.options.bin ||
      jointDataset.metaDict[chartProps.colorAxis.property].treatAsCategorical)
  ) {
    cohort.sort(chartProps.colorAxis.property);
  }
  const customData = cohort.unwrap(JointDataset.IndexLabel).map((val) => {
    const dict: Dictionary<any> = {};
    dict[JointDataset.IndexLabel] = val;
    return dict;
  });
  // plotlyProps.data[0].type = chartProps.chartType;
  // plotlyProps.data[0].mode = PlotlyMode.Markers;
  // plotlyProps.data[0].marker = {
  //   color: FabricStyles.fabricColorPalette[this.props.cohortIndex]
  // };
  if (chartProps.xAxis) {
    if (jointDataset.metaDict[chartProps.xAxis.property].treatAsCategorical) {
      const xLabels =
        jointDataset.metaDict[chartProps.xAxis.property]
          .sortedCategoricalValues;
      const xLabelIndexes = xLabels?.map((_, index) => index);
      // _.set(plotlyProps, "layout.xaxis.ticktext", xLabels);
      // _.set(plotlyProps, "layout.xaxis.tickvals", xLabelIndexes);
    }
    const rawX = cohort.unwrap(chartProps.xAxis.property);
    const xLabel = jointDataset.metaDict[chartProps.xAxis.property].label;
    if (chartProps.xAxis.options.dither) {
      const dithered = cohort.unwrap(JointDataset.DitherLabel);
      plotlyProps.data[0].x = dithered.map((dither, index) => {
        return rawX[index] + dither;
      });
      hoverTemplate += `${xLabel}: %{customData.X}<br>`;
      rawX.forEach((val, index) => {
        // If categorical, show string value in tooltip
        if (
          jointDataset.metaDict[chartProps.xAxis.property].treatAsCategorical
        ) {
          customData[index].X =
            jointDataset.metaDict[
              chartProps.xAxis.property
            ].sortedCategoricalValues?.[val];
        } else {
          customData[index].X = val;
        }
      });
    } else {
      plotlyProps.data[0].x = rawX;
      hoverTemplate += `${xLabel}: %{x}<br>`;
    }
  }
  if (chartProps.yAxis) {
    if (jointDataset.metaDict[chartProps.yAxis.property].treatAsCategorical) {
      const yLabels =
        jointDataset.metaDict[chartProps.yAxis.property]
          .sortedCategoricalValues;
      const yLabelIndexes = yLabels?.map((_, index) => index);
      _.set(plotlyProps, "layout.yaxis.ticktext", yLabels);
      _.set(plotlyProps, "layout.yaxis.tickvals", yLabelIndexes);
    }
    const rawY: number[] = cohort.unwrap(chartProps.yAxis.property);
    const yLabel = localization.Interpret.Charts.featureImportance;
    plotlyProps.data[0].y = rawY;
    rawY.forEach((val, index) => {
      customData[index].Yformatted = val.toLocaleString(undefined, {
        maximumFractionDigits: 3
      });
    });
    hoverTemplate += `${yLabel}: %{customData.Yformatted}<br>`;
  }
  const indecies = cohort.unwrap(JointDataset.IndexLabel, false);
  indecies.forEach((absoluteIndex, i) => {
    customData[i].AbsoluteIndex = absoluteIndex;
  });
  hoverTemplate += `${localization.Interpret.Charts.rowIndex}: %{customData.AbsoluteIndex}<br>`;
  hoverTemplate += "<extra></extra>";
  plotlyProps.data[0].customData = customData as any;
  plotlyProps.data[0].hoverTemplate = hoverTemplate;
  return {
    chart: {
      type: "lowmedhigh",
      zoomType: "xy"
    },
    legend: {},
    plotOptions: {
      scatter: {
        marker: {
          radius: 5,
          states: {
            hover: {
              enabled: true,
              lineColor: "green"
            }
          }
        }
      }
    },
    series: [
      {
        color: colorTheme.fontColor,
        data: data.map((d) => d.point),
        showInLegend: false,
        tooltip: {
          pointFormat: `${localization.CausalAnalysis.AggregateView.causalPoint}: {point.y:.6f}<br>`
        },
        type: "spline"
      },
      {
        color: colorTheme.fontColor,
        data: data.map((d) => [d.ci_lower, d.ci_upper]),
        tooltip: {
          pointFormat:
            `${localization.CausalAnalysis.AggregateView.confidenceUpper}: {point.high:.6f}<br>` +
            `${localization.CausalAnalysis.AggregateView.confidenceLower}: {point.low:.6f}<br><extra></extra>`
        },
        type: "errorbar"
      }
    ],
    title: {
      text: ""
    },
    tooltip: {
      shared: true
    },
    xAxis: [
      {
        categories: data.map((d) => getCausalDisplayFeatureName(d)),
        labels: {
          format: "{value}",
          style: {
            color: colorTheme.fontColor,
            fontSize: "14px"
          }
        }
      }
    ],
    yAxis: [
      {
        labels: {
          format: "{value}",
          style: {
            color: colorTheme.fontColor,
            fontSize: "14px"
          }
        },
        title: {
          text: ""
        }
      }
    ]
  };
}
