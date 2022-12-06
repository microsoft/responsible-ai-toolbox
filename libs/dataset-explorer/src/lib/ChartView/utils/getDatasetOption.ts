// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ChartTypes,
  IGenericChartProps,
  JointDataset
} from "@responsible-ai/core-ui";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";

import { getDatasetBarOption } from "./getDatasetBarOption";
import { getDatasetBoxOption } from "./getDatasetBoxOption";
import { getDatasetScatterOption } from "./getDatasetScatterOption";

export function getDatasetOption(
  plotlyProps: IPlotlyProperty,
  jointData: JointDataset,
  chartProps?: IGenericChartProps
): any {
  if (chartProps?.chartType === ChartTypes.Scatter) {
    return getDatasetScatterOption(jointData, plotlyProps, chartProps);
  }
  const yAxisProp = chartProps?.yAxis.property;
  if (
    yAxisProp &&
    (jointData.metaDict[yAxisProp].isCategorical ||
      jointData.metaDict[yAxisProp]?.treatAsCategorical)
  ) {
    return getDatasetBarOption(jointData, plotlyProps, chartProps);
  }
  return getDatasetBoxOption(jointData, plotlyProps, chartProps);
}
