// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import { IGenericChartProps, JointDataset } from "@responsible-ai/core-ui";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";

import { getDatasetBar } from "./getDatasetBar";

export function getDatasetBarOption(
  jointData: JointDataset,
  plotlyProps: IPlotlyProperty,
  chartProps?: IGenericChartProps
): any {
  const series = getDatasetBar(jointData, plotlyProps, chartProps);
  const xAxisProp = chartProps?.xAxis.property;
  const theme = getTheme();
  return {
    chart: {
      backgroundColor: theme.semanticColors.bodyBackground,
      type: "column"
    },
    series,
    xAxis: {
      categories:
        xAxisProp && jointData.metaDict[xAxisProp].sortedCategoricalValues,
      type: chartProps?.xAxis.type
    },
    yAxis: {
      type: chartProps?.yAxis.type
    }
  };
}
