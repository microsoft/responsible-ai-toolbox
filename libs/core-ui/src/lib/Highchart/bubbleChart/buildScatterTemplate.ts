// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import { IGenericChartProps } from "../../util/IGenericChartProps";
import { JointDataset } from "../../util/JointDataset";

export interface ICustomData {
  AbsoluteIndex?: number;
  Color?: number;
  Index?: number;
  template?: string;
}

export function buildScatterTemplate(
  jointData: JointDataset,
  chartProps: IGenericChartProps,
  x: number,
  y: number,
  index: number,
  absoluteIndex: number,
  showColorAxis?: boolean,
  xMap?: { [key: number]: string },
  yMap?: { [key: number]: string }
): ICustomData {
  let hovertemplate = "";
  const customData: ICustomData = {};
  const xName = jointData.metaDict[chartProps.xAxis.property].label;
  const yName = jointData.metaDict[chartProps.yAxis.property].label;
  const isXCategorical =
    jointData.metaDict[chartProps.xAxis.property].isCategorical ||
    jointData.metaDict[chartProps.xAxis.property].treatAsCategorical;
  const isYCategorical =
    jointData.metaDict[chartProps.yAxis.property].isCategorical ||
    jointData.metaDict[chartProps.yAxis.property].treatAsCategorical;
  const xValue = getAxisValueMapping(
    chartProps.xAxis.property,
    x,
    isXCategorical,
    xMap
  );
  const yValue = getAxisValueMapping(
    chartProps.yAxis.property,
    y,
    isYCategorical,
    yMap
  );
  if (chartProps.xAxis) {
    hovertemplate += `${xName}: ${xValue}<br>`;
  }
  if (chartProps.yAxis) {
    hovertemplate += `${yName}: ${yValue}<br>`;
  }
  if (showColorAxis && chartProps.colorAxis) {
    hovertemplate += `${
      jointData.metaDict[chartProps.colorAxis.property].label
    }: ${customData.Color}<br>`;
  }
  hovertemplate += `${localization.Interpret.Charts.rowIndex}: ${index}<br>`;
  hovertemplate += `${localization.Interpret.Charts.absoluteIndex}: ${absoluteIndex}<br>`;
  customData.template = hovertemplate;
  customData.AbsoluteIndex = absoluteIndex;
  customData.Index = index;
  return customData;
}

function getAxisValueMapping(
  axisProperty: string,
  axisValue: number,
  axisIsCategorical?: boolean,
  axisMap?: { [key: number]: string }
): string | number {
  if (
    axisMap &&
    (axisProperty === JointDataset.ClassificationError || axisIsCategorical)
  ) {
    const nearestValue = getNearestValue(axisValue, Object.keys(axisMap));
    return axisMap[nearestValue];
  }
  return axisValue;
}

function getNearestValue(axisValue: number, axisMapKeys: any[]): number {
  return axisMapKeys.reduce((prev, curr) =>
    Math.abs(curr - axisValue) < Math.abs(prev - axisValue) ? curr : prev
  );
}
