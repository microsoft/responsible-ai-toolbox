// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IData, IPlotlyProperty } from "@responsible-ai/mlchartlib";
import { Config, Layout } from "plotly.js";

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
    showlegend: false,
    xaxis: {
      autorange: true,
      fixedrange: true,
      linewidth: 1,
      mirror: true
    },
    yaxis: {
      automargin: true,
      autorange: "reversed",
      fixedrange: true,
      linewidth: 1,
      mirror: true,
      showgrid: true,
      showticklabels: true
    }
  };
}
