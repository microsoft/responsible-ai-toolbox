// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IMetricResponse } from "@responsible-ai/core-ui";
import _ from "lodash";
import { ErrorBar, Datum } from "plotly.js";

import { BarPlotlyProps } from "../BarPlotlyProps";
import { IFairnessContext } from "../util/IFairnessContext";

export function buildFalsePositiveErrorBounds(
  falsePositiveRates: IMetricResponse
): ErrorBar {
  return {
    // `array` and `arrayminus` are error bounds as described in Plotly API
    array: falsePositiveRates.binBounds?.map((binBound, index) => {
      if (falsePositiveRates?.bins[index] !== undefined) {
        return binBound.upper - falsePositiveRates.bins[index]; // convert from bounds to relative error
      }
      return 0;
    }) || [0],
    arrayminus: falsePositiveRates.binBounds?.map((binBound, index) => {
      if (falsePositiveRates?.bins[index] !== undefined) {
        return falsePositiveRates.bins[index] - binBound.lower; // convert from bounds to relative error
      }
      return 0;
    }) || [0],
    type: "data",
    visible: true
  };
}

export function buildFalseNegativeErrorBounds(
  falseNegativeRates: IMetricResponse
): ErrorBar {
  return {
    array: falseNegativeRates.binBounds?.map((binBound, index) => {
      if (falseNegativeRates?.bins[index] !== undefined) {
        return (binBound.upper - falseNegativeRates.bins[index]) * -1; // convert from bounds to relative error
      }
      return 0;
    }) || [0],
    arrayminus: falseNegativeRates.binBounds?.map((binBound, index) => {
      if (falseNegativeRates?.bins[index] !== undefined) {
        return (falseNegativeRates.bins[index] - binBound.lower) * -1; // convert from bounds to relative error
      }
      return 0;
    }) || [0],
    type: "data",
    visible: true
  };
}

export function buildCustomTooltips(
  barPlotlyProps: BarPlotlyProps,
  dashboardContext: IFairnessContext
): void {
  const digitsOfPrecision = 1;

  for (let j = 0; j < barPlotlyProps.data.length; j++) {
    const outcomeMetricName = barPlotlyProps.data[j].name;
    barPlotlyProps.data[j].customdata = [];
    if (barPlotlyProps.data) {
      for (let i = 0; i < dashboardContext.groupNames.length; i++) {
        const outcomeMetric = outcomeMetricName ? `${outcomeMetricName}: ` : "";
        const tempData = barPlotlyProps.data?.[j];
        const tempY = tempData ? tempData.y?.[i] : undefined;
        const tempX = tempData ? tempData.x?.[i] : undefined;

        // ensure x is number
        const x = typeof tempX == "number" ? tempX : undefined;
        // ensure y is string
        const y = typeof tempY == "string" ? tempY.trim() : undefined;
        const lowerErrorX =
          tempData?.error_x?.type === "data"
            ? tempData.error_x.arrayminus?.[i]
            : undefined;
        const upperErrorX =
          tempData?.error_x?.type === "data"
            ? tempData.error_x.array?.[i]
            : undefined;

        const xBounds =
          lowerErrorX !== 0 &&
          upperErrorX !== 0 &&
          typeof lowerErrorX == "number" &&
          typeof upperErrorX == "number" &&
          x !== undefined
            ? `[${(100 * (x - lowerErrorX)).toFixed(digitsOfPrecision)}%, ${(
                100 *
                (x + upperErrorX)
              ).toFixed(digitsOfPrecision)}%]`
            : "";
        const customdata = barPlotlyProps?.data?.[j]?.customdata;
        if (customdata && _.isArray(customdata)) {
          (customdata as Datum[]).push({
            outcomeMetric,
            x:
              x !== undefined
                ? (100 * x).toFixed(digitsOfPrecision)
                : undefined,
            xBounds,
            y
          } as unknown as Datum);
        }
        barPlotlyProps.data[j].hovertemplate =
          "<b>%{customdata.y}</b><br>%{customdata.outcomeMetric}%{customdata.x}% %{customdata.xBounds}<extra></extra>";
      }
    }
  }
}
