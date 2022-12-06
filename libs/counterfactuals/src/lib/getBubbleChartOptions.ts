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
  chartProps: IGenericChartProps,
  jointData: JointDataset,
  onBubbleClick?: (scatterPlotData: any) => void,
  onClickHandler?: (data: any) => void
  // getDatasetScatterOption?: (
  //   x_series: number[],
  //   y_series: number[],
  //   indexes: number[],
  //   chartProps: IGenericChartProps,
  //   jointData: JointDataset
  // ) => void
): IHighchartsConfig {
  // const colorTheme = {
  //   axisColor: theme?.palette.neutralPrimary,
  //   axisGridColor: theme?.palette.neutralLight,
  //   backgroundColor: theme?.palette.white,
  //   fontColor: theme?.semanticColors.bodyText
  // };

  const bubbleData = convertSDKObjectToBubbleData(data);
  console.log("!!bubbleData: ", bubbleData);
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
                onClickHandler
              );
              console.log(
                "!!in onclick: ",
                this.x,
                this.y,
                this,
                this["x_series"],
                scatterPlotData
              );
              onBubbleClick && onBubbleClick(scatterPlotData);
            }
          }
        }
      }
    },
    series: [
      {
        type: "bubble",
        data: bubbleData
        // data: [
        //   {
        //     x: 95,
        //     y: 95,
        //     z: 13.8,
        //     name: "BE",
        //     id: "Belgium"
        //   } as ExtendedPointOptionsObject,
        //   { x: 86.5, y: 102.9, z: 14.7, name: "DE", id: "Germany" },
        //   { x: 80.8, y: 91.5, z: 15.8, name: "FI", id: "Finland" },
        //   { x: 80.4, y: 102.5, z: 12, name: "NL", id: "Netherlands" },
        //   { x: 80.3, y: 86.1, z: 11.8, name: "SE", id: "Sweden" },
        //   { x: 78.4, y: 70.1, z: 16.6, name: "ES", id: "Spain" },
        //   { x: 74.2, y: 68.5, z: 14.5, name: "FR", id: "France" },
        //   { x: 73.5, y: 83.1, z: 10, name: "NO", id: "Norway" },
        //   { x: 71, y: 93.2, z: 24.7, name: "UK", id: "United Kingdom" },
        //   { x: 69.2, y: 57.6, z: 10.4, name: "IT", id: "Italy" },
        //   { x: 68.6, y: 20, z: 16, name: "RU", id: "Russia" },
        //   { x: 65.5, y: 126.4, z: 35.3, name: "US", id: "United States" },
        //   { x: 65.4, y: 50.8, z: 28.5, name: "HU", id: "Hungary" },
        //   { x: 63.4, y: 51.8, z: 15.4, name: "PT", id: "Portugal" },
        //   { x: 64, y: 82.9, z: 31.3, name: "NZ", id: "New Zealand" }
        // ]
      }
    ],
    tooltip: {
      useHTML: true,
      headerFormat: "<table>",
      pointFormat:
        "<tr><th>x values:</th><td>{point.x}</td></tr>" +
        "<tr><th>y values:</th><td>{point.y}</td></tr>" +
        "<tr><th>Size:</th><td>{point.z}</td></tr>",
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
  console.log("!!bubData: ", bubData);
  return bubData;
}
