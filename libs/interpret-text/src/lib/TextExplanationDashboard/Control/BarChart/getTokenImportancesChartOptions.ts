// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { NeutralColors, SharedColors } from "@fluentui/theme";
import { IHighchartsConfig } from "@responsible-ai/core-ui";
import { SeriesOptionsType } from "highcharts";

import { Utils } from "../../CommonUtils";
import { IChartProps } from "../../Interfaces/IChartProps";

export function getTokenImportancesChartOptions(
  props: IChartProps
): IHighchartsConfig {
  const importances = props.localExplanations;
  const k = props.topK!;
  const sortedList = Utils.sortedTopK(importances, k, props.radio!);
  const [x, y, ylabel, tooltip]: [number[], number[], string[], string[]] = [
    [],
    [],
    [],
    []
  ];
  sortedList.forEach((idx, i) => {
    let str = "";
    if (idx > 1) {
      str += "...";
    }
    if (idx > 0) {
      str += `${props.text[idx - 1]} `;
    }
    str += props.text[idx];
    if (idx < props.text.length - 1) {
      str += ` ${props.text[idx + 1]}`;
    }
    if (idx < props.text.length - 2) {
      str += "...";
    }
    y.push(i);
    x.push(importances[idx]);
    ylabel.push(props.text[idx]);
    tooltip.push(str);
  });
  // Put most significant word at the top by reversing order
  tooltip.reverse();
  ylabel.reverse();
  x.reverse();
  y.reverse();
  const data: any[] = [];
  x.forEach((p, index) => {
    const temp = {
      borderColor: SharedColors.blue10,
      color: (p || 0) >= 0 ? SharedColors.blue10 : NeutralColors.white,
      x: index,
      y: p
    };
    data.push(temp);
  });

  const series: SeriesOptionsType[] = [
    {
      data,
      name: "",
      showInLegend: false,
      type: "bar"
    }
  ];
  return {
    chart: {
      type: "bar"
    },
    plotOptions: {
      bar: {
        tooltip: {
          pointFormatter() {
            return `${tooltip[this.x || 0]}: ${this.y || 0}`;
          }
        }
      }
    },
    series,
    xAxis: {
      categories: ylabel
    }
  };
}
