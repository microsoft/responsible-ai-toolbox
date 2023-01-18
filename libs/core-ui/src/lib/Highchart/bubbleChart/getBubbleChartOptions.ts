// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import {
  IGenericChartProps,
  IHighchartsConfig,
  JointDataset,
  IHighchartBubbleSDKData,
  IHighchartBubbleData
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

import {
  getCounterfactualsScatterOption,
  IScatterPoint
} from "./getCounterfactualsScatterOption";

export function getBubbleChartOptions(
  data: IHighchartBubbleSDKData[],
  xAxisLabel: string,
  yAxisLabel: string,
  chartProps: IGenericChartProps,
  jointData: JointDataset,
  selectedPointsIndexes: number[],
  customPoints?: Array<{ [key: string]: any }>,
  isCounterfactualsDataLoading?: boolean,
  showColorAxis?: boolean,
  useDifferentColorForScatterPoints?: boolean,
  onBubbleClick?: (
    scatterPlotData: IHighchartsConfig,
    xSeries: number[],
    ySeries: number[],
    indexSeries: number[]
  ) => void,
  selectPointFromChartLargeData?: (data: IScatterPoint) => void,
  onIndexSeriesUpdated?: (indexSeries: number[]) => void
): IHighchartsConfig {
  const bubbleData = convertSDKObjectToBubbleData(data);
  const theme = getTheme();
  return {
    chart: {
      plotBorderWidth: 1,
      type: "bubble",
      zoomType: "xy"
    },
    custom: {
      disableUpdate: true
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      series: {
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "{point.name}"
        },
        point: {
          events: {
            click(): void {
              const scatterPlotData = getCounterfactualsScatterOption(
                this["xSeries"],
                this["ySeries"],
                this["indexSeries"],
                chartProps,
                jointData,
                selectedPointsIndexes,
                customPoints,
                isCounterfactualsDataLoading,
                showColorAxis,
                useDifferentColorForScatterPoints,
                selectPointFromChartLargeData
              );
              onBubbleClick &&
                onBubbleClick(
                  scatterPlotData,
                  this["xSeries"],
                  this["ySeries"],
                  this["indexSeries"]
                );
              onIndexSeriesUpdated && onIndexSeriesUpdated(this["indexSeries"]);
            }
          }
        }
      }
    },
    series: [
      {
        data: bubbleData,
        type: "bubble"
      }
    ],
    tooltip: {
      followPointer: true,
      footerFormat: "</table>",
      headerFormat: "<table>",
      pointFormat:
        `${xAxisLabel}: {point.x}<br>` +
        `${yAxisLabel}: {point.y}<br>` +
        `${localization.Counterfactuals.Size}: {point.z}<br>`,
      useHTML: true
    },
    xAxis: {
      gridLineWidth: 1,
      labels: {
        format: "{value}"
      },
      plotLines: [
        {
          color: theme.palette.black,
          dashStyle: "Dot",
          value: 65,
          width: 2,
          zIndex: 3
        }
      ]
    },
    yAxis: {
      endOnTick: false,
      labels: {
        format: "{value}"
      },
      maxPadding: 0.2,
      plotLines: [
        {
          color: theme.palette.black,
          dashStyle: "Dot",
          value: 50,
          width: 2,
          zIndex: 3
        }
      ],
      startOnTick: false
    }
  };
}

function convertSDKObjectToBubbleData(
  data: IHighchartBubbleSDKData[]
): IHighchartBubbleData[] {
  const bubData = Object.values(data).map((d) => {
    return {
      id: d.id,
      indexSeries: d.index_series,
      name: undefined,
      testData: d.test_data,
      x: d.x,
      xSeries: d.x_series,
      y: d.y,
      ySeries: d.y_series,
      z: d.size
    };
  });
  return bubData;
}
