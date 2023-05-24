// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { SeriesOptionsType } from "highcharts";
import _ from "lodash";

import { boxChartTooltipDefaultSetting } from "../Highchart/BoxChartTooltip";
import { getChartColors } from "../Highchart/ChartColors";
import { IGlobalSeries } from "../Highchart/FeatureImportanceBar";
import { IHighchartsConfig } from "../Highchart/IHighchartsConfig";

import { getBoxData } from "./getBoxData";

export function getFeatureImportanceBoxOptions(
  sortArray: number[],
  unsortedX: string[],
  unsortedSeries: IGlobalSeries[],
  topK: number,
  theme: ITheme,
  onFeatureSelection?: (seriesIndex: number, featureIndex: number) => void
): IHighchartsConfig {
  const chartColors = getChartColors(theme);
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
    const curMin = _.min(y) || 0;
    yAxisMin = Math.min(yAxisMin, curMin);
    boxTempData.push({
      color: chartColors[series.colorIndex],
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
      tooltip: boxChartTooltipDefaultSetting,
      type: "boxplot"
    });
  });

  return {
    chart: {
      backgroundColor: theme.semanticColors.bodyBackground,
      type: "boxplot"
    },
    legend: {
      enabled: true
    },
    plotOptions: {
      boxplot: {
        point: {
          events: {
            click(): void {
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
