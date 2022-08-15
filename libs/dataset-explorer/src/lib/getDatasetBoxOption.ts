// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import { getBoxData, getPrimaryChartColor } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";
import _ from "lodash";

export function getDatasetBoxOption(plotlyProps: IPlotlyProperty): any {
  const boxData = plotlyProps.data.map((d: any) => getBoxData(d.x, d.y).box);
  const outlier = plotlyProps.data.map(
    (d: any) => getBoxData(d.x, d.y).outlier
  );
  const theme = getTheme();
  const boxGroupData: any = [];
  boxData.forEach((data: any) => {
    boxGroupData.push({
      color: data.color,
      data,
      fillColor: theme.semanticColors.inputBackgroundChecked,
      name: localization.ModelAssessment.ModelOverview.BoxPlot
        .boxPlotSeriesLabel
    });
  });
  outlier.forEach((data: any) => {
    boxGroupData.push({
      data,
      marker: {
        fillColor: getPrimaryChartColor(theme)
      },
      name: localization.ModelAssessment.ModelOverview.BoxPlot.outlierLabel,
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
