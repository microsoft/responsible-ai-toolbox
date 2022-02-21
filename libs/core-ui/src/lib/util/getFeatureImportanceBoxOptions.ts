// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";

import { IGlobalSeries } from "../Highchart/FeatureImportanceBar";
import { IHighchartsConfig } from "../Highchart/HighchartTypes";

import { FabricStyles } from "./FabricStyles";
import { groupByFeature } from "./groupByFeature";

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
      data: groupByFeature(data.y, xText.length),
      name: data.name
    };
  });

  //   const seriesData: SeriesOptionsType[] = [
  //     {
  //       color: "red",
  //       data: [
  //         [760, 801, 848, 895, 965],
  //         [733, 853, 939, 980, 1080],
  //         [714, 762, 817, 870, 918],
  //         [724, 802, 806, 871, 950],
  //         [834, 836, 864, 882, 910]
  //       ],
  //       //   dataLabels: {
  //       //     color: colorTheme.fontColor
  //       //   },
  //       name: "111"
  //     } as unknown as SeriesOptionsType
  //   ];

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
    }
  };
}
