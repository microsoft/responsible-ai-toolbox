// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ColumnCategories,
  JointDataset,
  Cohort,
  ChartTypes,
  IGenericChartProps
} from "@responsible-ai/core-ui";

export function buildCustomData(
  jointData: JointDataset,
  chartProps: IGenericChartProps,
  cohort: Cohort
): any[] {
  const customdata = cohort.unwrap(JointDataset.IndexLabel).map((val) => {
    const dict = {};
    dict[JointDataset.IndexLabel] = val;
    return dict;
  });
  if (chartProps.chartType === ChartTypes.Scatter) {
    const xAxis = chartProps.xAxis;
    if (xAxis && xAxis.property && xAxis.options.dither) {
      const rawX = cohort.unwrap(chartProps.xAxis.property);
      rawX.forEach((val, index) => {
        // If categorical, show string value in tooltip
        if (jointData.metaDict[chartProps.xAxis.property].treatAsCategorical) {
          customdata[index]["X"] =
            jointData.metaDict[
              chartProps.xAxis.property
            ].sortedCategoricalValues?.[val];
        } else {
          customdata[index]["X"] = (val as number).toLocaleString(undefined, {
            maximumFractionDigits: 3
          });
        }
      });
    }
    const yAxis = chartProps.yAxis;
    if (yAxis && yAxis.property && yAxis.options.dither) {
      const rawY = cohort.unwrap(chartProps.yAxis.property);
      rawY.forEach((val, index) => {
        // If categorical, show string value in tooltip
        if (jointData.metaDict[chartProps.yAxis.property].treatAsCategorical) {
          customdata[index]["Y"] =
            jointData.metaDict[
              chartProps.yAxis.property
            ].sortedCategoricalValues?.[val];
        } else {
          customdata[index]["Y"] = (val as number).toLocaleString(undefined, {
            maximumFractionDigits: 3
          });
        }
      });
    }
    const colorAxis = chartProps.colorAxis;
    if (colorAxis && colorAxis.property) {
      const rawColor = cohort.unwrap(colorAxis.property);
      rawColor.forEach((val, index) => {
        if (jointData.metaDict[colorAxis.property].treatAsCategorical) {
          customdata[index]["Color"] =
            jointData.metaDict[colorAxis.property].sortedCategoricalValues?.[
              val
            ];
        } else {
          customdata[index]["Color"] = val.toLocaleString(undefined, {
            maximumFractionDigits: 3
          });
        }
      });
    }
    const indices = cohort.unwrap(JointDataset.IndexLabel, false);
    indices.forEach((absoluteIndex, i) => {
      customdata[i]["AbsoluteIndex"] = absoluteIndex;
    });
  }
  if (
    chartProps.chartType === ChartTypes.Histogram &&
    chartProps.yAxis.property !== ColumnCategories.None
  ) {
    const yMeta = jointData.metaDict[chartProps.yAxis.property];
    if (yMeta.treatAsCategorical) {
      const rawY = cohort.unwrap(chartProps.yAxis.property);
      rawY.forEach((val, index) => {
        customdata[index]["Y"] = yMeta.sortedCategoricalValues?.[val];
      });
    }
  }
  return customdata;
}
