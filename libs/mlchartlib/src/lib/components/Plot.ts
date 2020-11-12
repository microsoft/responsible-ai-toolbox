// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from "react";
import { PlotParams } from "react-plotly.js";

export const plot: React.FC<PlotParams> = (props: PlotParams) => {
  const plotComponent = React.lazy(async () => {
    const [plotly, createPlotlyComponent] = await Promise.all([
      import("plotly.js").then((md) => md.default),
      import("react-plotly.js/factory").then((md) => md.default)
    ]);
    return { default: createPlotlyComponent(plotly) };
  });

  return React.createElement(plotComponent, props);
};

export { plot as Plot };
