// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FluentUIStyles } from "@responsible-ai/core-ui";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";

export const basePlotlyProperties: IPlotlyProperty = {
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
      l: 20,
      r: 0,
      t: 0
    },
    showlegend: false,
    xaxis: {
      automargin: true,
      color: FluentUIStyles.chartAxisColor,
      mirror: true,
      tickfont: {
        family: FluentUIStyles.fontFamilies,
        size: 11
      },
      zeroline: true
    },
    yaxis: {
      automargin: true,
      color: FluentUIStyles.chartAxisColor,
      gridcolor: "#e5e5e5",
      showgrid: true,
      tickfont: {
        family: "Roboto, Helvetica Neue, sans-serif",
        size: 11
      },
      zeroline: true
    }
  }
};
