// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import {
  getBoxData,
  getPrimaryChartColor,
  IGenericChartProps,
  JointDataset,
  boxChartTooltipDefaultSetting
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";

export function getDatasetBoxOption(
  jointData: JointDataset,
  plotlyProps: IPlotlyProperty,
  chartProps?: IGenericChartProps
): any {
  const boxData = plotlyProps.data.map((d: any) => getBoxData(d.x, d.y).box);
  const outlier = plotlyProps.data.map(
    (d: any) => getBoxData(d.x, d.y).outlier
  );
  const theme = getTheme();
  const boxGroupData: any = [];
  let userFeatureName =
    localization.ModelAssessment.ModelOverview.BoxPlot.boxPlotSeriesLabel;
  if (chartProps?.yAxis.property) {
    userFeatureName = jointData.metaDict[chartProps?.yAxis.property].label;
  }
  boxData.forEach((data: any) => {
    boxGroupData.push({
      color: data.color,
      data,
      fillColor: theme.semanticColors.inputBackgroundChecked,
      name: userFeatureName,
      tooltip: boxChartTooltipDefaultSetting
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
      backgroundColor: theme.semanticColors.bodyBackground,
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
