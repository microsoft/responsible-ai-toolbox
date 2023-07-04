// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import { IGenericChartProps, JointDataset } from "@responsible-ai/core-ui";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";

import { getDatasetScatter } from "./getDatasetScatter";

export function getDatasetScatterOption(
  jointData: JointDataset,
  plotlyProps: IPlotlyProperty,
  chartProps?: IGenericChartProps
): any {
  const dataSeries = getDatasetScatter(jointData, plotlyProps, chartProps);
  const theme = getTheme();
  return {
    chart: {
      backgroundColor: theme.semanticColors.bodyBackground,
      type: "scatter"
    },
    plotOptions: {
      scatter: {
        tooltip: {
          headerFormat: "",
          pointFormat: "{point.customData.template}"
        }
      },
      series: {
        turboThreshold: 0
      }
    },
    series: dataSeries,
    xAxis: {
      type: chartProps?.xAxis.type
    },
    yAxis: {
      type: chartProps?.yAxis.type
    }
  };
}
