// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import {
  getPrimaryChartColor,
  IGenericChartProps,
  JointDataset
} from "@responsible-ai/core-ui";
import { PointMarkerOptionsObject } from "highcharts";

import { buildScatterTemplate } from "./buildScatterTemplate";

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

export function getCounterfactualsScatter(
  x_series: number[],
  y_series: number[],
  index_series: number[],
  jointData: JointDataset,
  chartProps?: IGenericChartProps
): any[] {
  const dataSeries: any = [];
  const result: IDatasetExplorerSeries[] = [];
  // const customData = plotlyProps.data[0].customdata;
  const xData = x_series;
  const yData = y_series;

  if (yData) {
    yData.forEach((data, index) => {
      dataSeries.push({
        customData:
          chartProps &&
          buildScatterTemplate(
            jointData,
            chartProps,
            xData?.[index],
            data,
            index,
            index_series[index]
          ),
        x: xData?.[index],
        y: data
      });
    });
  }

  result.push({
    color: getPrimaryChartColor(getTheme()),
    data: dataSeries,
    marker: {
      symbol: "circle"
    }
  });
  return result;
}
