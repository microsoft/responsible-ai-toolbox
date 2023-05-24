// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPlotlyProperty } from "@responsible-ai/mlchartlib";

export class WhatIfConstants {
  public static basePlotlyProperties: IPlotlyProperty = {
    config: { displaylogo: false, displayModeBar: false, responsive: true },
    data: [{}],
    layout: {
      autosize: true,
      dragmode: false,
      font: {
        size: 10
      },
      hovermode: "closest",
      margin: {
        b: 20,
        l: 10,
        r: 0,
        t: 10
      },
      showlegend: false,
      yaxis: {
        automargin: true
      }
    } as any
  };
  public static readonly MAX_SELECTION = 2;
  public static readonly MAX_CLASSES_TOOLTIP = 5;
  public static readonly colorPath = "Color";
  public static readonly namePath = "Name";
  public static readonly absoluteIndex = "AbsoluteIndex";
  public static readonly index = "Index";
  public static readonly IceKey = "ice";
  public static readonly featureImportanceKey = "feature-importance";
  public static readonly basePredictionTooltipIds = "predict-tooltip";
  public static readonly whatIfPredictionTooltipIds = "whatif-predict-tooltip";
}
