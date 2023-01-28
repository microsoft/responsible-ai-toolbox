// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ChartTypes,
  IGenericChartProps,
  ISelectorConfig,
  OtherChartTypes
} from "./IGenericChartProps";
import { JointDataset } from "./JointDataset";

export function generateDefaultChartAxes(
  jointDataset: JointDataset,
  chartType: ChartTypes | OtherChartTypes
): IGenericChartProps | undefined {
  if (!jointDataset.hasDataset) {
    return;
  }
  const chartProps: IGenericChartProps = {
    chartType: chartType ? chartType : ChartTypes.Scatter,
    colorAxis: {
      options: {},
      property: jointDataset.hasPredictedY
        ? JointDataset.PredictedYLabel
        : JointDataset.IndexLabel
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
