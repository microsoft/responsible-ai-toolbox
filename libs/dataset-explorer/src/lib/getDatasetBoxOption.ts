// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  boxPlotTooltip,
  FabricStyles,
  getBoxData
} from "@responsible-ai/core-ui";
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
      color: data.color,
      data,
      name: localization.Core.BoxPlot.boxPlotSeriesLabel,
      tooltip: boxPlotTooltip,
      type: "boxplot"
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
