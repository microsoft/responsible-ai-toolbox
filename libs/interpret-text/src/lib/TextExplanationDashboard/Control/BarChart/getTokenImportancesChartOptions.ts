// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { IHighchartsConfig } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { SeriesOptionsType } from "highcharts";
import _ from "lodash";

import { Utils } from "../../CommonUtils";
import { IChartProps } from "../../Interfaces/IChartProps";

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
        addItem(
          x,
          props.outputFeatureValue,
          ylabel,
          outputFeatureImportanceLabel,
          outputFeatureValueIndex
        );
      }
      if (Utils.addItem(props.baseValue, props.radio)) {
        addItem(
          x,
          props.baseValue,
          ylabel,
          baseValueLabel,
          baseValueFeatureValueIndex
        );
      }
    }
  }

  // Put most significant word at the top by reversing order
  tooltip.reverse();
  ylabel.reverse();
  x.reverse();
  y.reverse();
  const data: any[] = [];
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

  const series: SeriesOptionsType[] = [
    {
      data,
      dataLabels: {
        align: "center",
        color: theme.semanticColors.bodyBackground,
        enabled: true,
        // Don't show the data label inside the bars since it is redundant with the tooltips and y-axis labels
        formatter(): string | number | undefined {
          return "";
        },
        inside: true
      },
      name: "",
      showInLegend: false,
      type: "bar"
    }
  ];
  return {
    chart: {
      backgroundColor: theme.semanticColors.bodyBackground,
      type: "bar"
    },
    plotOptions: {
      bar: {
        minPointLength: 10,
        tooltip: {
          pointFormatter(): string {
            return `${tooltip[this.x || 0]}: ${this.y || 0}`;
          }
        } // Set the minimum pixel width for bars
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

function addItem(
  x: any[],
  xValue: any,
  yLabel: any[],
  yLabelValue: any,
  index: number
): void {
  x.splice(index, 0, xValue);
  yLabel.splice(index, 0, yLabelValue);
}
