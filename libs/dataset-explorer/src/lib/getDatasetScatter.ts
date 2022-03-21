// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FabricStyles,
  IGenericChartProps,
  JointDataset
} from "@responsible-ai/core-ui";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";
import _ from "lodash";

import { buildScatterTemplate } from "./buildScatterTemplate";

export interface IDatasetExplorerSeries {
  name?: string;
  color: any;
  data: IDatasetExplorerData[];
}
export interface IDatasetExplorerData {
  x: number;
  y: number;
  customData: any;
  template: string | undefined;
}

export function getDatasetScatter(
  jointData: JointDataset,
  plotlyProps: IPlotlyProperty,
  chartProps?: IGenericChartProps
): IDatasetExplorerSeries[] {
  const groupedData: any = [];
  const result: IDatasetExplorerSeries[] = [];
  const customData = plotlyProps.data[0].customdata;
  const xData = plotlyProps.data[0].x;
  const yData = plotlyProps.data[0].y;
  const groups = plotlyProps.data[0].transforms?.[0].groups;
  const styles = plotlyProps.data[0].transforms?.[0].styles;

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
    result.push({
      color:
        styles?.[index].value.marker?.color ||
        FabricStyles.fabricColorPalette[0],
      data: d
    });
  });
  return result;
}
