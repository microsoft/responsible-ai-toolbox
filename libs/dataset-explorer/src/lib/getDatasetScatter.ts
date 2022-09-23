// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import {
  getPrimaryChartColor,
  IGenericChartProps,
  JointDataset
} from "@responsible-ai/core-ui";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";
import { PointMarkerOptionsObject } from "highcharts";

import { buildScatterTemplate } from "./buildScatterTemplate";
import { getGroupedData } from "./getGroupedData";

export interface IDatasetExplorerSeries {
  name?: string;
  color: any;
  data: IDatasetExplorerData[];
  marker?: PointMarkerOptionsObject;
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

  if (groups) {
    return getGroupedData(
      xData as number[],
      yData as number[],
      customData,
      groups,
      styles,
      jointData,
      chartProps
    );
  }

  if (yData) {
    yData.forEach((data, index) => {
      const curGroup = groups?.[index] || 0;
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
        styles?.[index].value.marker?.color || getPrimaryChartColor(getTheme()),
      data: d,
      marker: {
        symbol: (styles?.[index].value.marker?.symbol as string) || "circle"
      }
    });
  });
  return result;
}
