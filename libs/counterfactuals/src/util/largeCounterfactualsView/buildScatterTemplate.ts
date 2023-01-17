// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IGenericChartProps, JointDataset } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export interface ICustomData {
  AbsoluteIndex?: number;
  Color?: number;
  Index?: number;
  template?: string;
}

export function buildScatterTemplate(
  jointData: JointDataset,
  chartProps: IGenericChartProps,
  x: any,
  y: any,
  index: number,
  absoluteIndex: number
): ICustomData {
  let hovertemplate = "";
  const customData: ICustomData = {};
  const xName = jointData.metaDict[chartProps.xAxis.property].label;
  const yName = jointData.metaDict[chartProps.yAxis.property].label;
  if (chartProps.xAxis) {
    hovertemplate += `${xName}: ${x}<br>`;
  }
  if (chartProps.yAxis) {
    hovertemplate += `${yName}: ${y}<br>`;
  }
  if (chartProps.colorAxis) {
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
