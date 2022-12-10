// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FluentUIStyles,
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
  selectedPointsIndexes: number[],
  chartProps?: IGenericChartProps
): any[] {
  const dataSeries: any = [];
  const result = [];
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
        marker: getMarker(selectedPointsIndexes, index),
        x: xData?.[index],
        y: data
      });
    });
  }

  result.push({
    // color: getPrimaryChartColor(getTheme()),
    data: dataSeries
    // marker: {
    //   symbol: "circle"
    // }
  });
  return result;
}

function getMarker(selectedPointsIndexes: number[], index: number): any {
  const selectionIndex = selectedPointsIndexes.indexOf(index);
  const color =
    selectionIndex === -1
      ? FluentUIStyles.fabricColorInactiveSeries
      : FluentUIStyles.fluentUIColorPalette[selectionIndex];

  const marker = {
    fillColor: color,
    radius: 4,
    symbol: selectionIndex === -1 ? "circle" : "square"
  };
  return marker;
}

export function updateScatterPlotMarker(
  plotData: any,
  selectedPointsIndexes: number[]
): any {
  const pData = plotData;
  pData.series[0].data.map(
    (d: {
      customData: { Index: number };
      marker: { fillColor: string; radius: number; symbol: string };
    }) => {
      const selectionIndex = selectedPointsIndexes.indexOf(d.customData.Index);
      const color =
        selectionIndex === -1
          ? FluentUIStyles.fabricColorInactiveSeries
          : FluentUIStyles.fluentUIColorPalette[selectionIndex];
      d.marker = {
        fillColor: color,
        radius: 4,
        symbol: selectionIndex === -1 ? "circle" : "square"
      };
    }
  );
  return pData;
}
