// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import { FluentUIStyles, IGenericChartProps } from "@responsible-ai/core-ui";
import { WhatIfConstants } from "@responsible-ai/interpret";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";

export function getCounterfactualChartOptions(
  plotlyProperty: IPlotlyProperty,
  onClickHandler?: (data: any) => void,
  chartProps?: IGenericChartProps
): any {
  let template = "";
  const data = plotlyProperty.data.map((series, seriesIndex) => {
    const data: any = [];
    series.x?.forEach((p, index) => {
      const markerColor = Array.isArray(series.marker?.color)
        ? series.marker.color[index]
        : series.marker?.color;
      const markerSymbol = Array.isArray(series.marker?.symbol)
        ? series.marker.symbol[index]
        : series.marker?.symbol;
      const temp = {
        customdata: series?.customdata?.[index],
        marker: {
          fillColor:
            seriesIndex === 0
              ? markerColor
              : FluentUIStyles.fluentUIColorPalette[
                  WhatIfConstants.MAX_SELECTION + 1 + index
                ],
          lineColor:
            seriesIndex === 0 ? undefined : series?.marker?.line?.color,
          lineWidth: seriesIndex === 0 ? undefined : 3,
          radius: seriesIndex === 0 ? 4 : 6,
          symbol: seriesIndex === 0 ? markerSymbol : "diamond"
        },
        x: p,
        y: series?.y?.[index]
      };
      template = series.hovertemplate as string;
      data.push(temp);
    });
    return data;
  });

  const series = data.map((d) => {
    return {
      data: d,
      name: "",
      showInLegend: false
    };
  });
  const theme = getTheme();
  return {
    chart: {
      backgroundColor: theme.semanticColors.bodyBackground,
      type: "scatter",
      zoomType: "xy"
    } as any,
    plotOptions: {
      scatter: {
        tooltip: {
          pointFormat: template
        }
      },
      series: {
        cursor: "pointer",
        point: {
          events: {
            click(): void {
              if (onClickHandler === undefined) {
                return;
              }
              onClickHandler(this);
            }
          }
        },
        turboThreshold: 0
      }
    },
    series,
    xAxis: {
      type: chartProps?.xAxis.type
    },
    yAxis: {
      type: chartProps?.yAxis.type
    }
  };
}
