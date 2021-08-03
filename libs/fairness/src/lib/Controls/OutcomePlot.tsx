// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBounds, PredictionTypes } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { AccessibleChart, chartColors } from "@responsible-ai/mlchartlib";
import { getTheme, Stack } from "office-ui-fabric-react";
import { Datum } from "plotly.js";
import React from "react";

import { BarPlotlyProps } from "../BarPlotlyProps";
import {
  IFeatureBinPickerPropsV2,
  IErrorPickerPropsV2
} from "../FairnessWizard";
import { IMetrics } from "../IMetrics";
import { SharedStyles } from "../Shared.styles";

import { FormatMetrics } from "./../util/FormatMetrics";
import { IFairnessContext } from "./../util/IFairnessContext";
import { performanceOptions } from "./../util/PerformanceMetrics";
import { ModalHelp } from "./ModalHelp";

interface IOutcomePlotProps {
  dashboardContext: IFairnessContext;
  metrics: IMetrics;
  areaHeights: number;
  featureBinPickerProps: IFeatureBinPickerPropsV2;
  errorPickerProps: IErrorPickerPropsV2;
  fairnessBounds?: Array<IBounds | undefined>;
  performanceBounds?: Array<IBounds | undefined>;
  outcomeBounds?: Array<IBounds | undefined>;
  falsePositiveBounds?: Array<IBounds | undefined>;
  falseNegativeBounds?: Array<IBounds | undefined>;
  parentErrorChanged: {
    (event: React.MouseEvent<HTMLElement>, checked?: boolean): void;
  };
}

export class OutcomePlot extends React.PureComponent<IOutcomePlotProps> {
  public render(): React.ReactNode {
    const barPlotlyProps = new BarPlotlyProps();
    const theme = getTheme();
    const sharedStyles = SharedStyles();
    const outcomeKey =
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
        ? "selection_rate"
        : "average";
    const outcomeMetric = performanceOptions[outcomeKey];
    console.log(outcomeMetric);
    let outcomeChartModalHelpStrings: string[] = [];
    const groupNamesWithBuffer = this.props.dashboardContext.groupNames.map(
      (name) => {
        return name + " ";
      }
    );

    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
    ) {
      barPlotlyProps.data = [
        {
          fillcolor: chartColors[0],
          hoverinfo: "skip",
          name: outcomeMetric.title,
          orientation: "h",
          text: this.props.metrics.outcomes.bins.map((num) =>
            FormatMetrics.formatNumbers(num, "selection_rate", false, 2)
          ),
          textposition: "inside",
          type: "bar",
          x: this.props.metrics.outcomes.bins,
          y: groupNamesWithBuffer
        }
      ];
      if (this.props.errorPickerProps.selectedErrorKey !== "disabled") {
        barPlotlyProps.data[0].error_x = {
          array: this.props.metrics.outcomes.binBounds?.map(
            (binBound, index) => {
              if (
                typeof this.props.metrics.outcomes?.bins[index] !== "undefined"
              ) {
                return binBound.upper - this.props.metrics.outcomes.bins[index]; // convert from bounds to relative error
              }
              return 0;
            }
          ) || [0],
          arrayminus: this.props.metrics.outcomes.binBounds?.map(
            (binBound, index) => {
              if (
                typeof this.props.metrics.outcomes?.bins[index] !== "undefined"
              ) {
                return this.props.metrics.outcomes.bins[index] - binBound.lower; // convert from bounds to relative error
              }
              return 0;
            }
          ) || [0],
          type: "data",
          visible: true
        };
        barPlotlyProps.data[0].textposition = "none";
      }
      if (barPlotlyProps.layout?.xaxis) {
        barPlotlyProps.layout.xaxis.tickformat = ",.0%";
      }
      outcomeChartModalHelpStrings = [
        localization.Fairness.Report.classificationOutcomesHowToRead
      ];
    }
    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.Probability
    ) {
      const outcomeText = this.props.metrics.predictions?.map((val) => {
        return localization.formatString(
          localization.Fairness.Report.tooltipPrediction,
          FormatMetrics.formatNumbers(val, "average", false, 3)
        );
      });
      barPlotlyProps.data = [
        {
          boxmean: true,
          boxpoints: "all",
          color: chartColors[0],
          hoverinfo: "text",
          hoveron: "points",
          jitter: 0.4,
          orientation: "h",
          pointpos: 0,
          text: outcomeText,
          type: "box",
          x: this.props.metrics.predictions,
          y: this.props.dashboardContext.binVector.map(
            (binIndex) => groupNamesWithBuffer[binIndex]
          )
        } as any
      ];
      outcomeChartModalHelpStrings = [
        localization.Fairness.Report.regressionOutcomesHowToRead
      ];
    }
    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.Regression
    ) {
      const outcomeText = this.props.metrics.predictions?.map((val) => {
        return localization.formatString(
          localization.Fairness.Report.tooltipPrediction,
          val
        );
      });
      barPlotlyProps.data = [
        {
          boxmean: true,
          boxpoints: "all",
          color: chartColors[0],
          hoverinfo: "text",
          hoveron: "points",
          jitter: 0.4,
          orientation: "h",
          pointpos: 0,
          text: outcomeText,
          type: "box",
          x: this.props.metrics.predictions,
          y: this.props.dashboardContext.binVector.map(
            (binIndex) => groupNamesWithBuffer[binIndex]
          )
        } as any
      ];
      outcomeChartModalHelpStrings = [
        localization.Fairness.Report.regressionOutcomesHowToRead
      ];
    }

    barPlotlyProps.data[0].customdata = ([] as unknown) as Datum[];
    const digitsOfPrecision = 1;

    for (let i = 0; i < this.props.dashboardContext.groupNames.length; i++) {
      const x = barPlotlyProps.data[0].x
        ? (Number(barPlotlyProps.data[0].x[i]) * 100).toFixed(digitsOfPrecision)
        : undefined;
      const y = barPlotlyProps.data[0].y
        ? String(barPlotlyProps.data[0].y[i]).trim()
        : undefined;

      const xBounds =
        barPlotlyProps.data[0]?.error_x?.type === "data" &&
        barPlotlyProps.data[0]?.error_x?.arrayminus &&
        barPlotlyProps.data[0]?.error_x?.array &&
        barPlotlyProps.data[0].error_x.arrayminus[i] !== 0 &&
        barPlotlyProps.data[0].error_x.array[i] !== 0 &&
        x
          ? "[" +
            (
              Number(x) -
              100 * Number(barPlotlyProps.data[0].error_x.arrayminus[i])
            ).toFixed(digitsOfPrecision) +
            "%, " +
            (
              Number(x) +
              100 * Number(barPlotlyProps.data[0].error_x.array[i])
            ).toFixed(digitsOfPrecision) +
            "%]"
          : "";

      barPlotlyProps.data[0].customdata.push(({
        outcomeMetric: outcomeMetric.title,
        x,
        xBounds,
        y
      } as unknown) as Datum);
      barPlotlyProps.data[0].hovertemplate =
        "<b>%{customdata.y}</b><br> %{customdata.outcomeMetric}: %{customdata.x}% %{customdata.xBounds}<extra></extra>";
    }

    return (
      <Stack id="outcomePlot">
        <div
          className={sharedStyles.presentationArea}
          style={{ height: `${this.props.areaHeights}px` }}
        >
          <div className={sharedStyles.chartWrapper}>
            <ModalHelp
              theme={theme}
              graphCalloutStrings={outcomeChartModalHelpStrings}
              errorPickerProps={this.props.errorPickerProps}
              fairnessBounds={this.props.fairnessBounds}
              performanceBounds={this.props.performanceBounds}
              outcomeBounds={this.props.outcomeBounds}
              falsePositiveBounds={this.props.falsePositiveBounds}
              falseNegativeBounds={this.props.falseNegativeBounds}
              parentErrorChanged={this.props.parentErrorChanged}
            />
            <div className={sharedStyles.chartBody}>
              <AccessibleChart
                plotlyProps={barPlotlyProps}
                theme={theme}
                themeOverride={{
                  axisGridColor: theme.semanticColors.disabledBorder
                }}
              />
            </div>
          </div>
        </div>
      </Stack>
    );
  }
}
