// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// import { IHighchartsConfig } from "@responsible-ai/core-ui";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";

export function getIndividualChartOptions(
  plotlyProperty: IPlotlyProperty,
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
