// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPlotlyProperty } from "@responsible-ai/mlchartlib";

export function getIndividualChartOptions(
  plotlyProperty: IPlotlyProperty,
  onClickHandler?: (data: any) => void
): any {
  let template = "";
  const data = plotlyProperty.data.map((series) => {
    const data: any = [];
    series.x?.forEach((p, index) => {
      const temp = {
        customdata: series?.customdata?.[index],
        marker: {
          fillColor: series?.marker?.color?.[index],
          radius: 4,
          symbol: series?.marker?.symbol?.[index]
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
      showInLegend: false
    };
  });
  return {
    chart: {
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
            click() {
              if (onClickHandler === undefined) {
                return;
              }
              onClickHandler(this);
            }
          }
        }
      }
    },
    series
  };
}
