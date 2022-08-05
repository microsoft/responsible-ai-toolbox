// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ChartTypes,
  IGenericChartProps,
  JointDataset
} from "@responsible-ai/core-ui";

export function generateDefaultChartAxes(
  jointDataset: JointDataset
): IGenericChartProps | undefined {
  const yKey = `${JointDataset.DataLabelRoot}0`;
  const yIsDithered = jointDataset.metaDict[yKey]?.treatAsCategorical;
  const chartProps: IGenericChartProps = {
    chartType: ChartTypes.Scatter,
    xAxis: {
      options: {},
      property: jointDataset.hasPredictedProbabilities
        ? `${JointDataset.ProbabilityYRoot}0`
        : JointDataset.IndexLabel
    },
    yAxis: {
      options: {
        bin: false,
        dither: yIsDithered
      },
      property: yKey
    }
  };
  return chartProps;
}
