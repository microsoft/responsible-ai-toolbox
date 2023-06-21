// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IExplanationModelMetadata,
  ModelExplanationUtils,
  IsMulticlass
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IPlotlyProperty, PlotlyThemes } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import Plotly from "plotly.js";
import React from "react";
import Plot from "react-plotly.js";

import { barChartStyles } from "./BarChart.styles";

export interface IBarChartProps {
  featureByClassMatrix: number[][];
  sortedIndexVector: number[];
  topK: number;
  intercept?: number[];
  modelMetadata: IExplanationModelMetadata;
  additionalRowData?: number[];
  barmode: "stack" | "group";
  defaultVisibleClasses?: number[];
  theme?: string;
}

export class BarChart extends React.PureComponent<IBarChartProps> {
  private static buildTextArray(
    sortedIndexVector: number[],
    importanceVector: number[],
    featureNames: string[],
    className?: string,
    rowDataArray?: Array<string | number>
  ): string[] {
    return _.flatMap(sortedIndexVector, (index) => {
      const result = [];
      result.push(
        localization.formatString(
          localization.Interpret.AggregateImportance.featureLabel,
          featureNames[index] || "unknown feature"
        )
      );
      result.push(
        localization.formatString(
          localization.Interpret.AggregateImportance.importanceLabel,
          importanceVector[index].toLocaleString(undefined, {
            minimumFractionDigits: 3
          })
        )
      );
      if (rowDataArray && rowDataArray.length > index) {
        result.push(
          localization.formatString(
            localization.Interpret.AggregateImportance.valueLabel,
            rowDataArray[index]
          )
        );
      }
      if (className) {
        result.push(
          localization.formatString(
            localization.Interpret.BarChart.classLabel,
            className
          )
        );
      }
      return result;
    });
  }

  private static buildInterceptTooltip(
    value: number,
    className?: string
  ): string[] {
    const result = [];
    result.push(localization.Interpret.intercept);
    result.push(
      localization.formatString(
        localization.Interpret.AggregateImportance.importanceLabel,
        value.toLocaleString(undefined, { minimumFractionDigits: 3 })
      )
    );
    if (className) {
      result.push(
        localization.formatString(
          localization.Interpret.BarChart.classLabel,
          className
        )
      );
    }
    return result;
  }

  public render(): React.ReactNode {
    if (this.hasData()) {
      const plotlyProps = this.buildPlotlyProps();
      const themedProps = this.props.theme
        ? PlotlyThemes.applyTheme(plotlyProps, this.props.theme)
        : plotlyProps;
      return (
        <Plot
          data={themedProps.data}
          layout={themedProps.layout as Plotly.Layout}
          config={themedProps.config}
        />
      );
    }
    return (
      <div className={barChartStyles.centered}>
        {localization.Interpret.BarChart.noData}
      </div>
    );
  }

  private hasData(): boolean {
    return this.props.featureByClassMatrix.length > 0;
  }

  private buildPlotlyProps(): IPlotlyProperty {
    const classByFeatureMatrix = ModelExplanationUtils.transpose2DArray(
      this.props.featureByClassMatrix
    );
    const sortedIndexVector = this.props.sortedIndexVector
      .slice(-1 * this.props.topK)
      .reverse();
    const baseSeries: IPlotlyProperty = {
      config: {
        displaylogo: false,
        displayModeBar: false,
        responsive: true
      },
      data: [],
      layout: {
        autosize: true,
        barmode: this.props.barmode,
        dragmode: false,
        font: {
          size: 10
        },
        hovermode: "closest",
        margin: { b: 30, r: 10, t: 10 },
        showlegend: classByFeatureMatrix.length > 1,
        xaxis: {
          automargin: true
        },
        yaxis: {
          automargin: true,
          title: localization.Interpret.featureImportance
        }
      }
    };

    if (classByFeatureMatrix.length > 0) {
      classByFeatureMatrix.forEach((singleSeries, classIndex) => {
        const visible =
          this.props.defaultVisibleClasses !== undefined &&
          !this.props.defaultVisibleClasses.includes(classIndex)
            ? "legendonly"
            : true;
        const x = sortedIndexVector.map((_, index) => index);
        const y = sortedIndexVector.map((index) => singleSeries[index]);
        const text = BarChart.buildTextArray(
          sortedIndexVector,
          singleSeries,
          this.props.modelMetadata.featureNames,
          IsMulticlass(this.props.modelMetadata.modelType)
            ? this.props.modelMetadata.classNames[classIndex]
            : undefined,
          this.props.additionalRowData
        );
        if (this.props.intercept) {
          x.unshift(-1);
          y.unshift(this.props.intercept[classIndex]);
          text.unshift(
            ...BarChart.buildInterceptTooltip(
              this.props.intercept[classIndex],
              IsMulticlass(this.props.modelMetadata.modelType)
                ? this.props.modelMetadata.classNames[classIndex]
                : undefined
            )
          );
        }

        const orientation = "v";
        baseSeries.data.push({
          hoverinfo: "text",
          name: IsMulticlass(this.props.modelMetadata.modelType)
            ? this.props.modelMetadata.classNames[classIndex]
            : "",
          orientation,
          text,
          type: "bar",
          visible,
          x,
          y
        });
      });
    }
    const tickText = sortedIndexVector.map(
      (i) => this.props.modelMetadata.featureNamesAbridged[i]
    );
    const tickValues = sortedIndexVector.map((_, index) => index);
    if (this.props.intercept) {
      tickText.unshift(localization.Interpret.intercept);
      tickValues.unshift(-1);
    }
    _.set(baseSeries, "layout.xaxis.ticktext", tickText);
    _.set(baseSeries, "layout.xaxis.tickvals", tickValues);
    return baseSeries;
  }
}
