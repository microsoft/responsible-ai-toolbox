// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getBoxData } from "@responsible-ai/core-ui";
import { IPlotlyProperty } from "@responsible-ai/mlchartlib";
import _ from "lodash";

export function getDatasetBoxOption(plotlyProps: IPlotlyProperty): any {
  const boxData = plotlyProps.data.map((d: any) => getBoxData(d.x, d.y));
  const boxGroupData = boxData.map((data: any) => {
    return {
      color: data.color,
      data,
      name: ""
    };
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
