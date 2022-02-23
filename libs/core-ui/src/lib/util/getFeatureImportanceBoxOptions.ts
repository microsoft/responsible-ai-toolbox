// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";

import { IGlobalSeries } from "../Highchart/FeatureImportanceBar";
import { IHighchartsConfig } from "../Highchart/HighchartTypes";

import { FabricStyles } from "./FabricStyles";
import { getBoxData } from "./getBoxData";

export function getFeatureImportanceBoxOptions(
  sortArray: number[],
  unsortedX: string[],
  unsortedSeries: IGlobalSeries[],
  topK: number,
  theme?: ITheme,
  onFeatureSelection?: (seriesIndex: number, featureIndex: number) => void
): IHighchartsConfig {
  const colorTheme = {
    axisColor: theme?.palette.neutralPrimary,
    axisGridColor: theme?.palette.neutralLight,
    backgroundColor: theme?.palette.white,
    fontColor: theme?.semanticColors.bodyText
  };
  const xText = sortArray.map((i) => unsortedX[i]);
  const boxTempData: any = [];
  let yAxisMin = Infinity;

  unsortedSeries.forEach((series) => {
    const base: number[] = [];
    const x = base.concat(
      ...sortArray.map(
        (sortIndex, xIndex) =>
          series.unsortedIndividualY?.[sortIndex].map(() => xIndex) || []
      )
    );
    const y = base.concat(
      ...sortArray.map((index) => series.unsortedIndividualY?.[index] || [])
    );
    const curMin = Math.min(...y);
    yAxisMin = Math.min(yAxisMin, curMin);
    boxTempData.push({
      color: FabricStyles.fabricColorPalette[series.colorIndex],
      name: series.name,
      x,
      y
    });
  });
  const boxGroupData = boxTempData.map((data: any) => {
    return {
      color: data.color,
      data: getBoxData(data.x, data.y),
      name: data.name
    };
  });
  return {
    chart: {
      backgroundColor: colorTheme.fontColor,
      type: "boxplot"
    },
    plotOptions: {
      series: {
        cursor: "pointer",
        point: {
          events: {
            click() {
              if (onFeatureSelection === undefined) {
                return;
              }
              const featureNumber = sortArray[this.x];
              onFeatureSelection(0, featureNumber);
            }
          }
        }
      }
    },
    series: boxGroupData,
    xAxis: {
      categories: xText,
      max: topK - 1
    },
    yAxis: {
      min: -1,
      title: {
        align: "high"
      }
    }
  };
}
