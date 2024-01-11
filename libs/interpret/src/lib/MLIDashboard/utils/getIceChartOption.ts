// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import {
  IExplanationModelMetadata,
  isTwoDimArray,
  ModelExplanationUtils,
  ModelTypes
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { RangeTypes, IData } from "@responsible-ai/mlchartlib";
import { map } from "lodash";

import { buildYAxis } from "./buildYAxis";
import { mergeXYData } from "./mergeXYData";

export interface IIceChartData {
  x?: number;
  y: number;
  customData: any[];
}
export function getIceChartOption(
  metadata: IExplanationModelMetadata,
  featureName: string,
  selectedClass: number,
  colors: string[],
  rowNames: string[],
  rangeType?: RangeTypes,
  xData?: Array<number | string>,
  yData?: number[][] | number[][][]
): any {
  if (
    yData === undefined ||
    xData === undefined ||
    yData.length === 0 ||
    yData.some((row: number[] | number[][]) => row === undefined)
  ) {
    return undefined;
  }
  const data: IData[] = map<number[] | number[][]>(
    yData,
    (singleRow: number[] | number[][], rowIndex: number) => {
      const transposedY: number[][] = isTwoDimArray(singleRow)
        ? ModelExplanationUtils.transpose2DArray(singleRow)
        : [singleRow];
      const predictionLabel =
        metadata.modelType === ModelTypes.Regression
          ? localization.Interpret.IcePlot.prediction
          : `${localization.Interpret.IcePlot.predictedProbability}: ${metadata.classNames[selectedClass]}`;

      const customData = transposedY[selectedClass].map((predY) => {
        return {
          Name: rowNames[rowIndex],
          template: "",
          Yformatted: predY.toLocaleString(undefined, {
            maximumFractionDigits: 3
          })
        };
      });
      customData.forEach((c, index) => {
        c.template = `${c.Name}<br>${featureName}: ${xData[index]}<br>${predictionLabel}: ${c.Yformatted}<br><extra></extra>`;
      });
      return {
        customdata: customData,
        marker: {
          color: colors[rowIndex]
        },
        name: rowNames[rowIndex],
        x: xData,
        y: transposedY[selectedClass]
      };
    }
  ) as any;
  const xAxisSetting =
    rangeType === RangeTypes.Categorical
      ? { categories: data[0]?.x, title: { text: featureName } }
      : {
          title: {
            text: featureName
          }
        };
  const dataSeries: any = data.map((d) => {
    return {
      color: d.marker?.color,
      data: mergeXYData(
        d.x,
        d.y,
        d.customdata,
        rangeType === RangeTypes.Categorical
      ),
      name: d.name
    };
  });
  const theme = getTheme();
  return {
    chart: {
      backgroundColor: theme.semanticColors.bodyBackground,
      type: rangeType === RangeTypes.Categorical ? "scatter" : ""
    },
    plotOptions: {
      line: {
        marker: {
          states: {
            hover: {
              enabled: true
            }
          }
        },
        tooltip: {
          headerFormat: "",
          pointFormat: "{point.customData.template}"
        }
      },
      scatter: {
        marker: {
          states: {
            hover: {
              enabled: true
            }
          }
        },
        tooltip: {
          headerFormat: "",
          pointFormat: "{point.customData.template}"
        }
      }
    },
    series: dataSeries,
    title: {
      text: ""
    },
    xAxis: xAxisSetting,
    yAxis: {
      title: {
        text: buildYAxis(metadata, selectedClass)
      }
    }
  };
}
