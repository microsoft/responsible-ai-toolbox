// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHighchartsConfig } from "../Highchart/HighchartTypes";
import { ICausalAnalysisSingleData } from "../Interfaces/ICausalAnalysisData";

// import { getCausalDisplayFeatureName } from "./getCausalDisplayFeatureName";

export function getErrorBarChartOptions(
  data: ICausalAnalysisSingleData[]
): IHighchartsConfig {
  return {
    chart: {
      type: "lowmedhigh",
      zoomType: "xy"
    },
    legend: {},
    series: [
      {
        data: data.map((d) => d.point),
        tooltip: {
          pointFormat:
            '<span style="font-weight: bold; color: {series.color}">{series.name}</span>: <b>{point.y:.1f}</b> '
        },
        type: "scatter"
      }
      // {
      //   data: [
      //     [0.024554703670239472, 0.07637320978494788],
      //     [0.0000018156074109169128, 0.0000162287897705993],
      //     [-0.2419328967749073, -0.1428698896693828]
      //   ],
      //   name: "Rainfall error",
      //   tooltip: {
      //     pointFormat: "(error range: {point.low}-{point.high} mm)<br/>"
      //   },
      //   type: "errorbar"
      // }
    ],
    title: {
      text: ""
    },
    tooltip: {
      shared: true
    },
    xAxis: [
      {
        categories: data.map((d) => d.feature)
      }
    ],
    yAxis: [
      {
        labels: {
          format: "{value}"
        },
        title: {
          text: ""
        }
      }
    ]
  };
}
