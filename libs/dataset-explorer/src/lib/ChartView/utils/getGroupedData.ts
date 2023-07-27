// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import {
  getPrimaryChartColor,
  IGenericChartProps,
  JointDataset
} from "@responsible-ai/core-ui";
import { TransformStyle } from "plotly.js";

import { buildScatterTemplate } from "./buildScatterTemplate";
import { IDatasetExplorerSeries } from "./getDatasetScatter";

export function getGroupedData(
  xData: number[],
  yData: number[],
  customData: any,
  groups: any,
  styles: TransformStyle[] | undefined,
  jointData: JointDataset,
  chartProps?: IGenericChartProps
): IDatasetExplorerSeries[] {
  const groupedData: any = [];
  const result: IDatasetExplorerSeries[] = [];
  if (yData) {
    yData.forEach((data, index) => {
      const curGroup = groups?.[index];
      if (curGroup !== undefined) {
        if (groupedData[curGroup] === undefined) {
          groupedData[curGroup] = [];
        }
        groupedData[curGroup].push({
          customData:
            chartProps &&
            buildScatterTemplate(
              jointData,
              chartProps,
              xData?.[index],
              data,
              customData?.[index]
            ),
          x: xData?.[index],
          y: data
        });
      }
    });
  }
  groupedData.forEach((d: any, index: number) => {
    if (styles) {
      result.push({
        color:
          styles[index]?.value.marker?.color ||
          getPrimaryChartColor(getTheme()),
        data: d,
        marker: {
          symbol: styles[index]?.value.marker?.symbol?.toString() || "circle"
        }
      });
    }
  });
  return result;
}
