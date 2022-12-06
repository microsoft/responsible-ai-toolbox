// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { SeriesTooltipOptionsObject } from "highcharts";

// Fix tooltip to use "lower whisker" and "upper whisker"
// instead of "minimum" and "maximum"
export const boxChartTooltipDefaultSetting: SeriesTooltipOptionsObject = {
  pointFormat:
    '<span style="color:{point.color}">●</span> <b>{series.name}</b><br/>' +
    `${localization.ModelAssessment.ModelOverview.BoxPlot.upperWhisker}: {point.high}<br/>` +
    `${localization.ModelAssessment.ModelOverview.BoxPlot.upperQuartile}: {point.q3}<br/>` +
    `${localization.ModelAssessment.ModelOverview.BoxPlot.median}: {point.median}<br/>` +
    `${localization.ModelAssessment.ModelOverview.BoxPlot.lowerQuartile}: {point.q1}<br/>` +
    `${localization.ModelAssessment.ModelOverview.BoxPlot.lowerWhisker} {point.low}<br/>`
};
