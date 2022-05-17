// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SeriesOptionsType } from "highcharts";

import { IGlobalSeries } from "../Highchart/FeatureImportanceBar";
import { IHighchartsConfig } from "../Highchart/IHighchartsConfig";

import { FabricStyles } from "./FabricStyles";
import { getBoxData } from "./getBoxData";

export function getFeatureImportanceBoxOptions(
  sortArray: number[],
  unsortedX: string[],
  unsortedSeries: IGlobalSeries[],
  topK: number,
  onFeatureSelection?: (seriesIndex: number, featureIndex: number) => void
): IHighchartsConfig {
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
  const boxGroupData: SeriesOptionsType[] = [];
  boxTempData.forEach((data: any) => {
    const boxData = getBoxData(data.x, data.y);
    boxGroupData.push({
      color: data.color,
      data: boxData.box,
      name: data.name,
      type: "boxplot"
    });
  });
  return {
    chart: {
      type: "boxplot"
    },
    legend: {
      enabled: true
    },
    plotOptions: {
      boxplot: {
        point: {
          events: {
            click() {
              if (onFeatureSelection === undefined) {
                return;
              }
              const featureNumber = sortArray[this.x];
              onFeatureSelection(this.series.index, featureNumber);
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
      min: yAxisMin,
      title: {
        align: "high"
      }
    }
  };
}
