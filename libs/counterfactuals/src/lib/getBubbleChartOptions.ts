// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IGenericChartProps,
  IHighchartsConfig,
  JointDataset,
  IHighchartBubbleSDKData,
  IHighchartBubbleData
} from "@responsible-ai/core-ui";
import { getCounterfactualsScatterOption } from "./getCounterfactualsScatterOption";

export interface IBubbleData {
  x: number;
  y: number;
  customData: any[];
}

// interface ExtendedPointOptionsObject extends Highcharts.PointOptionsObject {
//   id: string;
//   size: number;
// }

export function getBubbleChartOptions(
  data: any,
  xAxisLabel: string,
  yAxisLabel: string,
  chartProps: IGenericChartProps,
  jointData: JointDataset,
  selectedPointsIndexes: number[],
  customPoints?: Array<{ [key: string]: any }>,
  isCounterfactualsDataLoading?: boolean,
  onBubbleClick?: (
    scatterPlotData: any,
    x_series: number[],
    y_series: number[],
    index_series: number[]
  ) => void,
  selectPointFromChartLargeData?: (data: any) => void,
  onIndexSeriesUpdated?: (indexSeries?: number[]) => void
): IHighchartsConfig {
  const bubbleData = convertSDKObjectToBubbleData(data);
  return {
    chart: {
      type: "bubble",
      plotBorderWidth: 1,
      zoomType: "xy"
    },
    legend: {
      enabled: false
    },
    custom: {
      disableUpdate: true
    },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          format: "{point.name}"
        },
        cursor: "pointer",
        point: {
          events: {
            click(): void {
              const scatterPlotData = getCounterfactualsScatterOption(
                this["x_series"],
                this["y_series"],
                this["index_series"],
                chartProps,
                jointData,
                selectedPointsIndexes,
                customPoints,
                isCounterfactualsDataLoading,
                selectPointFromChartLargeData
              );
              onBubbleClick &&
                onBubbleClick(
                  scatterPlotData,
                  this["x_series"],
                  this["y_series"],
                  this["index_series"]
                );
              onIndexSeriesUpdated &&
                onIndexSeriesUpdated(this["index_series"]);
            }
          }
        }
      }
    },
    series: [
      {
        type: "bubble",
        data: bubbleData
      }
    ],
    tooltip: {
      useHTML: true,
      headerFormat: "<table>",
      pointFormat:
        `${xAxisLabel}: {point.x}<br>` +
        `${yAxisLabel}: {point.y}<br>` +
        `Size: {point.z}<br>`,
      footerFormat: "</table>",
      followPointer: true
    },
    xAxis: {
      gridLineWidth: 1,
      labels: {
        format: "{value}"
      },
      plotLines: [
        {
          color: "black",
          dashStyle: "Dot",
          width: 2,
          value: 65,
          zIndex: 3
        }
      ],
      accessibility: {
        rangeDescription: "Range: 60 to 100 grams."
      }
    },
    yAxis: {
      startOnTick: false,
      endOnTick: false,
      labels: {
        format: "{value}"
      },
      maxPadding: 0.2,
      plotLines: [
        {
          color: "black",
          dashStyle: "Dot",
          width: 2,
          value: 50,
          zIndex: 3
        }
      ],
      accessibility: {
        rangeDescription: "Range: 0 to 160 grams."
      }
    }
  };
}

function convertSDKObjectToBubbleData(
  data: IHighchartBubbleSDKData[]
): IHighchartBubbleData[] {
  const bubData = Object.values(data).map((d) => {
    return {
      id: d.id,
      name: undefined,
      z: d.size,
      x: d.x,
      y: d.y,
      index_series: d.index_series,
      x_series: d.x_series,
      y_series: d.y_series
    };
  });
  return bubData;
}
