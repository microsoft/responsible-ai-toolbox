// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IData, IPlotlyProperty } from "@responsible-ai/mlchartlib";
import { getTheme } from "office-ui-fabric-react";
import { Config, Layout } from "plotly.js";

import { chartColors } from "../util/chartColors";
const theme = getTheme();
export class BarPlotlyProps implements IPlotlyProperty {
  public config?: Partial<Config> | undefined = {
    displaylogo: false,
    modeBarButtonsToRemove: [
      "toggleSpikelines",
      "hoverClosestCartesian",
      "hoverCompareCartesian",
      "zoom2d",
      "pan2d",
      "select2d",
      "lasso2d",
      "zoomIn2d",
      "zoomOut2d",
      "autoScale2d",
      "resetScale2d"
    ],
    responsive: true
  };
  public data: IData[] = [
    {
      orientation: "h",
      type: "bar"
    } as any
  ];
  public layout: Partial<Layout> | undefined = {
    autosize: true,
    barmode: "relative",
    colorway: chartColors,
    font: {
      size: 10
    },
    hovermode: "closest",
    margin: {
      b: 20,
      l: 0,
      r: 0,
      t: 4
    },
    plot_bgcolor: theme.semanticColors.bodyFrameBackground,
    showlegend: false,
    xaxis: {
      autorange: true,
      fixedrange: true,
      linecolor: theme.semanticColors.disabledBorder,
      linewidth: 1,
      mirror: true
    },
    yaxis: {
      autorange: "reversed",
      dtick: 1,
      fixedrange: true,
      gridcolor: theme.semanticColors.disabledBorder,
      gridwidth: 1,
      showgrid: true,
      showticklabels: false,
      tick0: 0.5
    }
  };
}
