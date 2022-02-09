// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  IDependenceData,
  IGenericChartProps,
  JointDataset
} from "@responsible-ai/core-ui";
import _, { Dictionary } from "lodash";

export function getDependenceData(
  chartProps: IGenericChartProps | undefined,
  jointData: JointDataset,
  cohort: Cohort
): IDependenceData[] {
  if (!chartProps) {
    return [];
  }
  if (
    chartProps.colorAxis &&
    (chartProps.colorAxis.options.bin ||
      jointData.metaDict[chartProps.colorAxis.property].treatAsCategorical)
  ) {
    cohort.sort(chartProps.colorAxis.property);
  }
  let xData: number[] = [];
  let yData: number[] = [];
  // const hoverTemplates: string[] = [];

  const customData = cohort.unwrap(JointDataset.IndexLabel).map((val) => {
    const dict: Dictionary<any> = {};
    dict[JointDataset.IndexLabel] = val;
    return dict;
  });
  if (chartProps.xAxis) {
    const rawX = cohort.unwrap(chartProps.xAxis.property);
    if (chartProps.xAxis.options.dither) {
      const dithered = cohort.unwrap(JointDataset.DitherLabel);
      xData = dithered.map((dither, index) => {
        return rawX[index] + dither;
      });
      rawX.forEach((val, index) => {
        // If categorical, show string value in tooltip
        if (jointData.metaDict[chartProps.xAxis.property].treatAsCategorical) {
          customData[index].X =
            jointData.metaDict[
              chartProps.xAxis.property
            ].sortedCategoricalValues?.[val];
        } else {
          customData[index].X = val;
        }
      });
    } else {
      xData = _.cloneDeep(rawX);
    }
  }
  if (chartProps.yAxis) {
    yData = cohort.unwrap(chartProps.yAxis.property);
    yData.forEach((val, index) => {
      customData[index].Yformatted = val.toLocaleString(undefined, {
        maximumFractionDigits: 3
      });
    });
  }
  const result = customData.map((d, index) => {
    return {
      customData: d,
      x: xData[index],
      y: yData[index]
    } as IDependenceData;
  });
  return result;
}
