// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { SeriesTooltipOptionsObject } from "highcharts";

/* By default the tooltip used by highcharts describes the five points
   as Minimum, Lower quartile, Median, Upper Quartile, and Maximum.
   However, since points can lie outside of the box and it's whiskers/fences
   the terms Maximum and Minimum aren't appropriate. Instead, we rename
   them to lower and upper fence which is consistent with plotly's way of
   handling it.
*/
export const boxPlotTooltip: SeriesTooltipOptionsObject = {
  pointFormatter() {
    return `<span style="color:${this.color}">●</span>
      <b> ${this.series.name}</b><br/>
      ${localization.Core.BoxPlot.upperFence}: ${this.options.high}<br/>
      ${localization.Core.BoxPlot.upperQuartile}: ${this.options.q3}<br/>
      ${localization.Core.BoxPlot.median}: ${this.options.median}<br/>
      ${localization.Core.BoxPlot.lowerQuartile}: ${this.options.q1}<br/>
      ${localization.Core.BoxPlot.lowerFence}: ${this.options.low}<br/>`;
  }
};
