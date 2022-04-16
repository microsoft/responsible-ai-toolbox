// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IGenericChartProps, JointDataset } from "@responsible-ai/core-ui";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";
import _ from "lodash";

import { getDatasetBar } from "./getDatasetBar";

export function getDatasetBarOption(
  jointData: JointDataset,
  plotlyProps: IPlotlyProperty,
  chartProps?: IGenericChartProps
): any {
  const series = getDatasetBar(jointData, plotlyProps, chartProps);

  return {
    chart: {
      type: "column"
    },
    series,
    xAxis: {
      categories:
        chartProps?.xAxis.property &&
        jointData.metaDict[chartProps.xAxis.property].sortedCategoricalValues
    }
  };
}
