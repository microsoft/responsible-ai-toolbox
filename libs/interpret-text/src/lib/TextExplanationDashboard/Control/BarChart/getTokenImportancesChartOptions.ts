// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { IHighchartsConfig } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { SeriesOptionsType } from "highcharts";

import { Utils } from "../../CommonUtils";
import { IChartProps } from "../../Interfaces/IChartProps";
import _ from "lodash";

function findNearestIndex(
  array: number[],
  target?: number
): number | undefined {
  if (!target) {
    return array.length;
  }
  const nearestElement = _.minBy(array, (element) =>
    Math.abs(element - target)
  );
  return _.indexOf(array, nearestElement);
}

export function getTokenImportancesChartOptions(
  props: IChartProps,
  theme: ITheme
): IHighchartsConfig {
  const importances = props.localExplanations;
  // console.log("importances: ", importances);
  const k = props.topK;
  const sortedList = Utils.sortedTopK(importances, k, props.radio);

  const outputFeatureImportanceLabel = `f ${
    props.text[props.selectedTokenIndex || 0]
  } (inputs)`;
  const baseValueLabel = "base value";
  const [x, y, ylabel, tooltip]: [number[], number[], string[], string[]] = [
    [],
    [],
    [],
    []
  ];
  // console.log("!!sortedList: ", sortedList);
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

  // add output feature importance
  if (props.outputFeatureValue && props.baseValue) {
    const outputFeatureValueIndex = findNearestIndex(
      x,
      props.outputFeatureValue
    );
    const baseValueFeatureValueIndex = findNearestIndex(x, props.baseValue);
    if (outputFeatureValueIndex && baseValueFeatureValueIndex) {
      if (Utils.addItem(props.outputFeatureValue, props.radio)) {
        x.splice(outputFeatureValueIndex, 0, props.outputFeatureValue);
        ylabel.splice(outputFeatureValueIndex, 0, outputFeatureImportanceLabel);
      }
      if (Utils.addItem(props.baseValue, props.radio)) {
        x.splice(baseValueFeatureValueIndex, 0, props.baseValue);
        ylabel.splice(baseValueFeatureValueIndex, 0, baseValueLabel);
      }
    }
  }

  // Put most significant word at the top by reversing order
  tooltip.reverse();
  ylabel.reverse();
  x.reverse();
  y.reverse();
  const data: any[] = [];
  // console.log("!!x: ", x);
  // console.log("!!y: ", y);
  // console.log("!!y: ", ylabel);
  x.forEach((p, index) => {
    const temp = {
      color:
        (p || 0) >= 0
          ? theme.semanticColors.errorText
          : theme.semanticColors.link,
      x: index,
      y: p
    };
    data.push(temp);
  });

  // console.log("!!data: ", data);

  const series: SeriesOptionsType[] = [
    {
      data,
      name: "",
      showInLegend: false,
      type: "bar",
      dataLabels: {
        enabled: true,
        inside: true, // Display data labels inside the bars
        color: "#FFFFFF", // Text color of the data labels
        align: "center", // Align data labels to the center of each bar
        formatter: function () {
          return this.x; // Display the Y-axis value inside the bar
        }
      }
    }
  ];
  return {
    chart: {
      backgroundColor: theme.semanticColors.bodyBackground,
      type: "bar"
    },
    plotOptions: {
      bar: {
        tooltip: {
          pointFormatter(): string {
            return `${tooltip[this.x || 0]}: ${this.y || 0}`;
          }
        },
        minPointLength: 10 // Set the minimum pixel width for bars
      }
    },
    series,
    xAxis: {
      categories: ylabel
    },
    yAxis: {
      title: {
        text: localization.Interpret.featureImportance
      }
    }
  };
}
