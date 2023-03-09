// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IGenericChartProps,
  ChartTypes,
  JointDataset,
  ISelectorConfig
} from "@responsible-ai/core-ui";

export function generateDefaultChartAxes(
  jointDataset: JointDataset
): IGenericChartProps | undefined {
  if (!jointDataset.hasDataset) {
    return;
  }
  let colorAxisProperty = JointDataset.IndexLabel;
  if (jointDataset.hasPredictedY) {
    if (jointDataset.numLabels > 1) {
      colorAxisProperty = `${JointDataset.PredictedYLabel}0`;
    } else {
      colorAxisProperty = JointDataset.PredictedYLabel;
    }
  }
  const chartProps: IGenericChartProps = {
    chartType: ChartTypes.Histogram,
    colorAxis: {
      options: {},
      property: colorAxisProperty
    },
    xAxis: {
      options: {},
      property: JointDataset.IndexLabel
    },
    yAxis: generateDefaultYAxis(jointDataset)
  };
  return chartProps;
}

export function generateDefaultYAxis(
  jointDataset: JointDataset
): ISelectorConfig {
  const yKey = `${JointDataset.DataLabelRoot}0`;
  const yIsDithered = jointDataset.metaDict[yKey]?.treatAsCategorical;
  return {
    options: {
      bin: false,
      dither: yIsDithered
    },
    property: yKey
  };
}
