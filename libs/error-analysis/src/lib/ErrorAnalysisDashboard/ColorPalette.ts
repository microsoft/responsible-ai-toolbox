// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { lab as Lab } from "d3-color";

export enum ColorPalette {
  MinColor = "#F4D1D2",
  MaxColor = "#8d2323",
  ErrorAvgColor = "#b2b7bd",
  FillStyle = "#d2d2d2",
  SelectedLineColor = "#089acc",
  UnselectedLineColor = "#e8eaed",
  LinkLabelOutline = "#089acc",
  ErrorAnalysisLightText = "white",
  ErrorAnalysisDarkBlackText = "rgba(0,0,0,0.8)",
  ErrorAnalysisDarkGreyText = "#555"
}

export function isColorDark(colorStr: string | undefined): boolean {
  if (!colorStr) {
    return false;
  }
  const val = Lab(colorStr).l;
  return val <= 65;
}
