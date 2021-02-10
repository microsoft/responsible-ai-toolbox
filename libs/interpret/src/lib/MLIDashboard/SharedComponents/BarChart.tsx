// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IExplanationModelMetadata,
  ModelTypes,
  ModelExplanationUtils
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IPlotlyProperty, PlotlyThemes } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import Plotly from "plotly.js";
import React from "react";
import { v4 } from "uuid";

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
  private guid: string = v4();

  private static buildTextArray(
    sortedIndexVector: number[],
    importanceVector: number[],
    featureNames: string[],
    className?: string,
    rowDataArray?: Array<string | number>
  ): string[] {
    return sortedIndexVector.map((index) => {
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
      return result.join("<br>");
    });
  }

  private static buildInterceptTooltip(
    value: number,
    className?: string
  ): string {
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
    return result.join("<br>");
  }

  public render(): React.ReactNode {
    if (this.hasData()) {
      const plotlyProps = this.buildPlotlyProps();
      const themedProps = this.props.theme
        ? PlotlyThemes.applyTheme(plotlyProps, this.props.theme)
        : plotlyProps;
      window.setTimeout(async () => {
        await Plotly.react(
          this.guid,
          themedProps.data,
          themedProps.layout,
          themedProps.config
        );
      }, 0);
      return <div className={barChartStyles.barChart} id={this.guid} />;
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
      } as Plotly.Config,
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
      } as any
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
          this.props.modelMetadata.modelType === ModelTypes.Multiclass
            ? this.props.modelMetadata.classNames[classIndex]
            : undefined,
          this.props.additionalRowData
        );
        if (this.props.intercept) {
          x.unshift(-1);
          y.unshift(this.props.intercept[classIndex]);
          text.unshift(
            BarChart.buildInterceptTooltip(
              this.props.intercept[classIndex],
              this.props.modelMetadata.modelType === ModelTypes.Multiclass
                ? this.props.modelMetadata.classNames[classIndex]
                : undefined
            )
          );
        }

        const orientation = "v";
        baseSeries.data.push({
          hoverinfo: "text",
          name:
            this.props.modelMetadata.modelType === ModelTypes.Multiclass
              ? this.props.modelMetadata.classNames[classIndex]
              : "",
          orientation,
          text,
          type: "bar",
          visible,
          x,
          y
        } as any);
      });
    }
    const ticktext = sortedIndexVector.map(
      (i) => this.props.modelMetadata.featureNamesAbridged[i]
    );
    const tickvals = sortedIndexVector.map((_, index) => index);
    if (this.props.intercept) {
      ticktext.unshift(localization.Interpret.intercept);
      tickvals.unshift(-1);
    }
    _.set(baseSeries, "layout.xaxis.ticktext", ticktext);
    _.set(baseSeries, "layout.xaxis.tickvals", tickvals);
    return baseSeries;
  }
}
