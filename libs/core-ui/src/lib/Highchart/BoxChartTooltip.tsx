// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SeriesTooltipOptionsObject } from "highcharts";

// Fix tooltip to use "lower whisker" and "upper whisker"
// instead of "minimum" and "maximum"
export const boxChartTooltipDefaultSetting: SeriesTooltipOptionsObject = {
  pointFormat:
    '<span style="color:{point.color}">●</span> <b>{series.name}</b><br/>Upper whisker: {point.high}<br/>Upper quartile: {point.q3}<br/>Median: {point.median}<br/>Lower quartile: {point.q1}<br/>Lower whisker: {point.low}<br/>'
};
