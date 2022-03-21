// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IGenericChartProps, JointDataset } from "@responsible-ai/core-ui";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";
import _ from "lodash";

import { getDatasetScatter } from "./getDatasetScatter";

export function getDatasetScatterOption(
  jointData: JointDataset,
  plotlyProps: IPlotlyProperty,
  chartProps?: IGenericChartProps
): any {
  const dataSeries = getDatasetScatter(jointData, plotlyProps, chartProps);
  return {
    chart: {
      type: "scatter",
      zoomType: "xy"
    },
    plotOptions: {
      scatter: {
        marker: {
          states: {
            hover: {
              enabled: true
              // lineColor: colorTheme.axisColor
            }
          }
        },
        tooltip: {
          headerFormat: "",
          pointFormat: `{point.customData.template}`
        }
      }
    },
    series: dataSeries
  };
}
