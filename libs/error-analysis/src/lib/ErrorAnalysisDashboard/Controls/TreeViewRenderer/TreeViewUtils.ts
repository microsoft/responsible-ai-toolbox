import { ColorPalette } from "./../../ColorPalette";

export function nodeColor(isErrorMetric: boolean, perc: number): string {
  if (perc == 0) {
    return ColorPalette.white;
  }
  if (isErrorMetric) {
    if (perc > 0.75) {
      return ColorPalette.ErrorColor100;
    }
    if (perc > 0.5) {
      return ColorPalette.ErrorColor75;
    }
    if (perc > 0.25) {
      return ColorPalette.ErrorColor50;
    }
    if (perc > 0.5) {
      return ColorPalette.ErrorColor25;
    }
    if (perc > 0) {
      return ColorPalette.ErrorColor5;
    }
  } else {
    if (perc > 0.75) {
      return ColorPalette.MetricColor100;
    }
    if (perc > 0.5) {
      return ColorPalette.MetricColor75;
    }
    if (perc > 0.25) {
      return ColorPalette.MetricColor50;
    }
    if (perc > 0.5) {
      return ColorPalette.MetricColor25;
    }
    if (perc > 0) {
      return ColorPalette.MetricColor5;
    }
  }
  return ColorPalette.ErrorAvgColor;
}
