// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import { IGenericChartProps } from "@responsible-ai/core-ui";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";

export function getIndividualChartOptions(
  plotlyProperty: IPlotlyProperty,
  chartProps?: IGenericChartProps,
  onClickHandler?: (data: any) => void
): any {
  let template = "";
  const data = plotlyProperty.data.map((series, seriesIndex) => {
    const data: any = [];
    series.x?.forEach((p, index) => {
      const temp = {
        customdata: series?.customdata?.[index],
        marker: {
          fillColor:
            seriesIndex === 0 ? series?.marker?.color?.[index] : undefined,
          lineColor:
            seriesIndex === 0 ? undefined : series?.marker?.line?.color,
          lineWidth: seriesIndex === 0 ? undefined : 3,
          radius: seriesIndex === 0 ? 4 : 6,
          symbol:
            seriesIndex === 0 ? series?.marker?.symbol?.[index] : "diamond"
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
      name: ""
    };
  });
  const theme = getTheme();
  return {
    chart: {
      backgroundColor: theme.semanticColors.bodyBackground,
      type: "scatter",
      zoomType: "xy"
    },
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
