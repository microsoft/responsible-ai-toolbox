// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FluentUIStyles,
  IGenericChartProps,
  JointDataset
} from "@responsible-ai/core-ui";
//import { WhatIfConstants } from "@responsible-ai/interpret";
import { PointMarkerOptionsObject } from "highcharts";
// import { Dictionary } from "lodash";
// import { localization } from "@responsible-ai/localization";

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
  selectedPointsIndexes: number[],
  _customPoints?: Array<{ [key: string]: any }>,
  _chartProps?: IGenericChartProps
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

// export function addCustomPoints(
//   plotData: any,
//   selectedPointsIndexes: number[],
//   customPoints: Array<{ [key: string]: any }>,
//   chartProps: IGenericChartProps,
//   jointDataset: JointDataset
// ): any {
//   const pData = plotData;

//   // if (customPoints) {
//   //   customPoints.forEach((cp, index) => {
//   //     pData.series[0].data.push({
//   //       customData: getCustomPointCustomData(cp),
//   //       marker: getCustomPointMarker(customPoints),
//   //       x: rawX[index],
//   //       y: rawY[index]
//   //     });
//   //   });
//   // }

//   pData.series[0].data.push(
//     (d: {
//       customData: { Index: number };
//       marker: { fillColor: string; radius: number; symbol: string };
//     }) => {
//       const selectionIndex = selectedPointsIndexes.indexOf(d.customData.Index);
//       const color =
//         selectionIndex === -1
//           ? FluentUIStyles.fabricColorInactiveSeries
//           : FluentUIStyles.fluentUIColorPalette[selectionIndex];
//       d.marker = {
//         fillColor: color,
//         radius: 4,
//         symbol: selectionIndex === -1 ? "circle" : "square"
//       };
//     }
//   );
//   return pData;
// }

// function getCustomPointMarker(
//   customPoints: Array<{ [key: string]: any }>
// ): any {
//   return {
//     color: customPoints.map(
//       (_, i) =>
//         FluentUIStyles.fluentUIColorPalette[
//           WhatIfConstants.MAX_SELECTION + 1 + i
//         ]
//     ),
//     size: 12,
//     symbol: "star"
//   };
// }

// function getCustomPointCustomData(
//   customPoint: { [key: string]: any }
// ): any {
//   let customData: ICustomData = {};
//   const customdata = JointDataset.unwrap(
//     customPoints,
//     JointDataset.IndexLabel
//   ).map((val) => {
//     const dict: Dictionary<any> = {};
//     dict[JointDataset.IndexLabel] = val;
//     return dict;
//   });
//   let hovertemplate = "{point.customdata.Name}<br>";
//   if (chartProps.xAxis) {
//     const metaX = jointDataset.metaDict[chartProps.xAxis.property];
//     const rawX = JointDataset.unwrap(customPoints, chartProps.xAxis.property);
//     hovertemplate += `${metaX.label}: {point.customdata.X}<br>`;
//     rawX.forEach((val, index) => {
//       if (metaX?.treatAsCategorical) {
//         customdata[index].X = metaX.sortedCategoricalValues?.[val];
//       } else {
//         customdata[index].X = (val as number).toLocaleString(undefined, {
//           maximumSignificantDigits: 5
//         });
//       }
//     });
//   }

//   if (chartProps.yAxis) {
//     const metaY = jointDataset.metaDict[chartProps.yAxis.property];
//     const rawY = JointDataset.unwrap(customPoints, chartProps.yAxis.property);
//     hovertemplate += `${metaY.label}: {point.customdata.Y}<br>`;
//     rawY.forEach((val, index) => {
//       if (metaY?.treatAsCategorical) {
//         customdata[index].Y = metaY.sortedCategoricalValues?.[val];
//       } else {
//         customdata[index].Y = (val as number).toLocaleString(undefined, {
//           maximumSignificantDigits: 5
//         });
//       }
//     });
//   }
//   hovertemplate += `${localization.Interpret.Charts.rowIndex}: {point.customdata.Index}<br>`;
//   hovertemplate += "<extra></extra>";
//   customdata.template = hovertemplate;
// }
