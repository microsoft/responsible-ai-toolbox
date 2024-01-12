// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ChartBuilder,
  IPlotlyProperty,
  PlotlyMode
} from "@responsible-ai/mlchartlib";
import _ from "lodash";
import { Datum } from "plotly.js";

import { IFairnessContext } from "../util/IFairnessContext";

export interface IFairness {
  Fairness: number;
  FairnessLowerBound: number;
  FairnessUpperBound: number;
  index: number;
  Performance: number;
  PerformanceLowerBound: number;
  PerformanceUpperBound: number;
}

function formatBoundsTooltip(
  lowerError: Datum | undefined,
  upperError: Datum | undefined,
  digitsOfPrecision: number,
  baseMetric: number | undefined
): string {
  return lowerError !== 0 &&
    upperError !== 0 &&
    typeof lowerError == "number" &&
    typeof upperError == "number" &&
    baseMetric !== undefined
    ? `[${(baseMetric - lowerError).toFixed(digitsOfPrecision)}, ${(
        baseMetric + upperError
      ).toFixed(digitsOfPrecision)}]`
    : "";
}

export const defaultPlotlyProps: IPlotlyProperty = {
  config: {
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
  },
  data: [
    {
      datapointLevelAccessors: {
        customdata: {
          path: ["index"],
          plotlyPath: "customdata"
        }
      },
      hoverinfo: "text",
      marker: {
        size: 14
      },
      mode: PlotlyMode.TextMarkers,
      textposition: "top",
      type: "scatter",
      xAccessor: "Performance",
      xAccessorLowerBound: "PerformanceLowerBound",
      xAccessorUpperBound: "PerformanceUpperBound",
      yAccessor: "Fairness",
      yAccessorLowerBound: "FairnessLowerBound",
      yAccessorUpperBound: "FairnessUpperBound"
    } as any
  ],
  layout: {
    autosize: true,
    font: {
      size: 10
    },
    hovermode: "closest",
    margin: {
      r: 0,
      t: 4
    },
    xaxis: {
      automargin: true,
      fixedrange: true,
      linewidth: 1,
      mirror: true,
      showgrid: true,
      title: {
        text: "Error"
      }
    },
    yaxis: {
      automargin: true,
      fixedrange: true,
      linewidth: 1,
      mirror: true,
      showgrid: true,
      title: {
        text: "Fairness"
      }
    }
  } as any
};

export function getPlotlyProps(
  dashboardContext: IFairnessContext,
  data: IFairness[],
  performanceMetricTitle: string,
  fairnessMetricTitle: string
): IPlotlyProperty {
  const props = _.cloneDeep(defaultPlotlyProps);

  props.data = ChartBuilder.buildPlotlySeries(props.data[0], data).map(
    (series) => {
      if (series.name) {
        series.name = dashboardContext.modelNames[series.name];
      }

      series.customdata = [];
      const digitsOfPrecision = 4;

      for (let modelId = 0; modelId < data.length; modelId++) {
        const tempX = series.x ? series.x[modelId] : undefined;
        const tempY = series.y ? series.y[modelId] : undefined;
        const lowerErrorX =
          series?.error_x?.type === "data"
            ? series.error_x.arrayminus?.[modelId]
            : undefined;
        const upperErrorX =
          series?.error_x?.type === "data"
            ? series.error_x.array?.[modelId]
            : undefined;
        const lowerErrorY =
          series?.error_y?.type === "data"
            ? series.error_y.arrayminus?.[modelId]
            : undefined;
        const upperErrorY =
          series?.error_y?.type === "data"
            ? series.error_y.array?.[modelId]
            : undefined;

        const x = series.x && typeof tempX == "number" ? tempX : undefined;
        const y = series.y && typeof tempY == "number" ? tempY : undefined;

        const xBounds = formatBoundsTooltip(
          lowerErrorX,
          upperErrorX,
          digitsOfPrecision,
          x
        );
        const yBounds = formatBoundsTooltip(
          lowerErrorY,
          upperErrorY,
          digitsOfPrecision,
          y
        );

        (series.customdata as Datum[]).push({
          modelId,
          x: x?.toFixed(digitsOfPrecision),
          xBounds,
          y: y?.toFixed(digitsOfPrecision),
          yBounds
        } as unknown as Datum);
        series.hovertemplate =
          "%{text} <br>%{xaxis.title.text}: %{customdata.x} %{customdata.xBounds}<br> %{yaxis.title.text}: %{customdata.y} %{customdata.yBounds}<extra></extra>";
      }

      series.text = dashboardContext.modelNames;
      return series;
    }
  );
  if (props.layout?.xaxis) {
    props.layout.xaxis.title = performanceMetricTitle;
  }
  if (props.layout?.yaxis) {
    props.layout.yaxis.title = fairnessMetricTitle;
  }
  return props;
}
