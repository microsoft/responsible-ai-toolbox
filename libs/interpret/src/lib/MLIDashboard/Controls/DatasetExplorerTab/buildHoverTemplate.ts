// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { ChartTypes } from "../../ChartTypes";
import { IGenericChartProps } from "../../IGenericChartProps";
import { ColumnCategories, JointDataset } from "../../JointDataset";

export function buildHoverTemplate(
  jointData: JointDataset,
  chartProps: IGenericChartProps
): string {
  let hovertemplate = "";
  const xName = jointData.metaDict[chartProps.xAxis.property].label;
  const yName = jointData.metaDict[chartProps.yAxis.property].label;
  switch (chartProps.chartType) {
    case ChartTypes.Scatter: {
      if (chartProps.xAxis) {
        if (chartProps.xAxis.options.dither) {
          hovertemplate += xName + ": %{customdata.X}<br>";
        } else {
          hovertemplate += xName + ": %{x}<br>";
        }
      }
      if (chartProps.yAxis) {
        if (chartProps.yAxis.options.dither) {
          hovertemplate += yName + ": %{customdata.Y}<br>";
        } else {
          hovertemplate += yName + ": %{y}<br>";
        }
      }
      if (chartProps.colorAxis) {
        hovertemplate +=
          jointData.metaDict[chartProps.colorAxis.property].label +
          ": %{customdata.Color}<br>";
      }
      hovertemplate +=
        localization.Charts.rowIndex + ": %{customdata.AbsoluteIndex}<br>";
      break;
    }
    case ChartTypes.Histogram: {
      hovertemplate += xName + ": %{text}<br>";
      if (
        chartProps.yAxis.property !== ColumnCategories.None &&
        jointData.metaDict[chartProps.yAxis.property].treatAsCategorical
      ) {
        hovertemplate += yName + ": %{customdata.Y}<br>";
      }
      hovertemplate += localization.formatString(
        localization.Charts.countTooltipPrefix,
        "%{y}<br>"
      );
      break;
    }
    default:
  }
  hovertemplate += "<extra></extra>";
  return hovertemplate;
}
