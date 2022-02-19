// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { SeriesOptionsType } from "highcharts";

import { IGlobalSeries } from "../Highchart/FeatureImportanceBar";
import { IHighchartsConfig } from "../Highchart/HighchartTypes";

import { FabricStyles } from "./FabricStyles";

export function getFeatureImportanceBarOptions(
  sortArray: number[],
  unsortedX: string[],
  unsortedSeries: IGlobalSeries[],
  topK: number,
  originX?: string[],
  theme?: ITheme
): IHighchartsConfig {
  const colorTheme = {
    axisColor: theme?.palette.neutralPrimary,
    axisGridColor: theme?.palette.neutralLight,
    backgroundColor: theme?.palette.white,
    fontColor: theme?.semanticColors.bodyText
  };
  const sortedIndexVector = sortArray;
  const xText = sortedIndexVector.map((i) => unsortedX[i]);
  const xOriginText = sortedIndexVector.map((i) => {
    if (originX) {
      return originX[i];
    }
    return unsortedX[i];
  });
  const x = sortedIndexVector.map((_, index) => index);
  const allData: any = [];

  unsortedSeries.forEach((series) => {
    allData.push({
      color: FabricStyles.fabricColorPalette[series.colorIndex],
      customdata: sortedIndexVector.map((value, index) => {
        return {
          HoverText: xOriginText[index],
          Name: series.name,
          Yformatted: series.unsortedAggregateY[value].toLocaleString(
            undefined,
            {
              maximumFractionDigits: 3
            }
          ),
          Yvalue: series.unsortedFeatureValues
            ? series.unsortedFeatureValues[value]
            : undefined
        };
      }),
      name: series.name,
      orientation: "v",
      text: xText,
      x,
      y: sortedIndexVector.map((index) => series.unsortedAggregateY[index])
    });
  });
  const seriesData: SeriesOptionsType[] = allData.map((d: any) => {
    return {
      color: d.color,
      data: d.y,
      dataLabels: {
        color: colorTheme.fontColor
      },
      name: d.name,
      type: "column"
    };
  });

  return {
    chart: {
      type: "column"
    },
    series: seriesData,
    title: {
      text: ""
    },
    xAxis: {
      categories: xText,
      max: topK - 1
    },
    yAxis: {
      min: 0,
      title: {
        align: "high"
      }
    }
  };
}
