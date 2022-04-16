// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IGenericChartProps, JointDataset } from "@responsible-ai/core-ui";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";
import _ from "lodash";

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

  if (customData && xData) {
    for (const [i, customDatum] of customData.entries()) {
      if (!groupedData[(customDatum as any).Y]) {
        groupedData[(customDatum as any).Y] = new Array(xDataTypeCount).fill(0);
      }
      groupedData[(customDatum as any).Y][xData[i]] += 1;
    }
  }

  if (chartProps?.yAxis.property) {
    jointData.metaDict[
      chartProps.yAxis.property
    ].sortedCategoricalValues?.forEach((value) => {
      result.push({
        data: groupedData[value],
        name: value
      });
    });
  }

  return result;
}
