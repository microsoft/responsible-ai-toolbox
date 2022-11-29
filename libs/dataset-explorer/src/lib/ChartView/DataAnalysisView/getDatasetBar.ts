// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IGenericChartProps, JointDataset } from "@responsible-ai/core-ui";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";

interface IDatasetExplorerSeries {
  name: string;
  color?: any;
  data: any[];
}

export function getDatasetBar(
  jointData: JointDataset,
  plotlyProps: IPlotlyProperty,
  chartProps?: IGenericChartProps
): IDatasetExplorerSeries[] {
  const result: IDatasetExplorerSeries[] = [];
  const groupedData = new Map<string, number[]>();
  const customData = plotlyProps.data[0].customdata;
  const xData = plotlyProps.data[0].x;
  const xDataTypeCount =
    chartProps?.xAxis.property &&
    jointData.metaDict[chartProps.xAxis.property].sortedCategoricalValues
      ?.length;
  const noneGroup = "none";

  if (customData && xData) {
    for (const [i, customDatum] of customData.entries()) {
      const yValue = (customDatum as any).Y ?? noneGroup;
      if (!groupedData[yValue]) {
        groupedData[yValue] = new Array(xDataTypeCount).fill(0);
      }
      groupedData[yValue][xData[i]] += 1;
    }
  }

  if (chartProps?.yAxis.property) {
    const groups = jointData.metaDict[chartProps.yAxis.property]
      .sortedCategoricalValues ?? [noneGroup];
    groups.forEach((value) => {
      result.push({
        data: groupedData[value],
        name: value
      });
    });
  }

  return result;
}
