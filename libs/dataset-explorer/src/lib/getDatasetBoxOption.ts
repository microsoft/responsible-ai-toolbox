// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FabricStyles, getBoxData } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";
import { SeriesOptionsType } from "highcharts";
import _ from "lodash";

export function getDatasetBoxOption(plotlyProps: IPlotlyProperty): any {
  const boxData = plotlyProps.data.map((d: any) => getBoxData(d.x, d.y).box);
  const outlier = plotlyProps.data.map(
    (d: any) => getBoxData(d.x, d.y).outlier
  );
  const boxGroupData: SeriesOptionsType[] = [];
  boxData.forEach((data: any) => {
    boxGroupData.push({
      type: "boxplot",
      color: data.color,
      data,
      name: localization.Core.BoxPlot.boxPlotSeriesLabel,
      tooltip: {
        pointFormatter() {
          return `<span style="color:${this.color}">●</span>
          <b> ${this.series.name}</b><br/>
          ${localization.Core.BoxPlot.upperFence}: ${this.options.high}<br/>
          ${localization.Core.BoxPlot.upperQuartile}: ${this.options.q3}<br/>
          ${localization.Core.BoxPlot.median}: ${this.options.median}<br/>
          ${localization.Core.BoxPlot.lowerQuartile}: ${this.options.q1}<br/>
          ${localization.Core.BoxPlot.lowerFence}: ${this.options.low}<br/>`;
        }
      }
    });
  });
  outlier.forEach((data: any) => {
    boxGroupData.push({
      data,
      marker: {
        fillColor: FabricStyles.fabricColorPalette[0],
        lineWidth: 35
      },
      name: localization.Core.BoxPlot.outlierLabel,
      type: "scatter"
    });
  });
  return {
    chart: {
      type: "boxplot"
    },
    series: boxGroupData,
    xAxis: {
      categories: plotlyProps.layout?.xaxis?.ticktext
    },
    yAxis: {
      title: {
        align: "high"
      }
    }
  };
}
