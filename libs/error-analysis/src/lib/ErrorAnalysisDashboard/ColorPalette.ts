// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import { lab as Lab } from "d3-color";

const theme = getTheme();

export class ColorPalette {
  public static MinErrorColor = "#F4D1D2";
  public static MaxErrorColor = theme.palette.redDark;
  public static MinMetricColor = theme.palette.greenLight;
  public static MaxMetricColor = theme.palette.greenDark;
  public static ErrorAvgColor = "#b2b7bd";
  public static FillStyle = "#d2d2d2";
  public static SelectedLineColor = "#089acc";
  public static UnselectedLineColor = "#e8eaed";
  public static LinkLabelOutline = "#089acc";
  public static ErrorAnalysisLightText = "white";
  public static ErrorAnalysisDarkBlackText = "rgba(0,0,0,0.8)";
  public static ErrorAnalysisDarkGreyText = "#555";
  public static DisabledColor = theme.palette.neutralSecondary;
  public static NodeFilledColor = "#F3F2F1";
  public static NodeOutlineColor = "#B3B0AD";
  public static ErrorColor100 = "#791818";
  public static white = "#FFFFFF";
  public static MetricColor100 = "#0B5A08";
}

export function isColorDark(colorStr: string | undefined): boolean {
  if (!colorStr) {
    return false;
  }
  const val = Lab(colorStr).l;
  return val <= 65;
}
