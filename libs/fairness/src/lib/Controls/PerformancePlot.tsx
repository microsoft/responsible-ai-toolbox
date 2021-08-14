// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBounds, PredictionTypes } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { AccessibleChart, chartColors } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import { getTheme, Stack } from "office-ui-fabric-react";
import { Datum } from "plotly.js";
import React from "react";

import { BarPlotlyProps } from "../BarPlotlyProps";
import {
  IErrorPickerProps,
  IFeatureBinPickerPropsV2,
  IPerformancePickerPropsV2
} from "../FairnessWizard";
import { IMetrics } from "../IMetrics";
import { SharedStyles } from "../Shared.styles";

import { FormatMetrics } from "./../util/FormatMetrics";
import { IFairnessContext } from "./../util/IFairnessContext";
import { CalloutHelpBar } from "./CalloutHelpBar";
import { PerformancePlotLegend } from "./PerformancePlotLegend";

interface IPerformancePlotProps {
  dashboardContext: IFairnessContext;
  metrics: IMetrics;
  areaHeights: number;
  performancePickerProps: IPerformancePickerPropsV2;
  featureBinPickerProps: IFeatureBinPickerPropsV2;
  errorPickerProps: IErrorPickerProps;
  fairnessBounds?: Array<IBounds | undefined>;
  performanceBounds?: Array<IBounds | undefined>;
  outcomeBounds?: Array<IBounds | undefined>;
  falsePositiveBounds?: Array<IBounds | undefined>;
  falseNegativeBounds?: Array<IBounds | undefined>;
  parentErrorChanged: {
    (event: React.MouseEvent<HTMLElement>, checked?: boolean): void;
  };
}

export class PerformancePlot extends React.PureComponent<IPerformancePlotProps> {
  public render(): React.ReactNode {
    const barPlotlyProps = new BarPlotlyProps();
    const theme = getTheme();
    const sharedStyles = SharedStyles();
    let performanceChartCalloutHelpBarStrings: string[] = [];
    const groupNamesWithBuffer = this.props.dashboardContext.groupNames.map(
      (name) => {
        return `${name} `;
      }
    );

    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
    ) {
      barPlotlyProps.data = [
        {
          color: chartColors[0],
          hoverinfo: "skip",
          name: localization.Fairness.Metrics.falsePositiveRate,
          orientation: "h",
          text: this.props.metrics.falsePositiveRates?.bins.map((num) =>
            FormatMetrics.formatNumbers(num, "fallout_rate", false, 2)
          ),
          textposition: "auto",
          type: "bar",
          width: 0.5,
          x: this.props.metrics.falsePositiveRates?.bins,
          y: groupNamesWithBuffer
        } as any,
        {
          color: chartColors[1],
          hoverinfo: "skip",
          name: localization.Fairness.Metrics.falseNegativeRate,
          orientation: "h",
          text: this.props.metrics.falseNegativeRates?.bins.map((num) =>
            FormatMetrics.formatNumbers(num, "miss_rate", false, 2)
          ),
          textposition: "auto",
          type: "bar",
          width: 0.5,
          x: this.props.metrics.falseNegativeRates?.bins.map((x) => -1 * x),
          y: groupNamesWithBuffer
        }
      ];
      // Plot Error Bars
      if (
        this.props.errorPickerProps.errorBarsEnabled &&
        this.props.metrics.falsePositiveRates !== undefined
      ) {
        barPlotlyProps.data[0].error_x = {
          // `array` and `arrayminus` are error bounds as described in Plotly API
          array: this.props.metrics.falsePositiveRates.binBounds?.map(
            (binBound, index) => {
              if (
                this.props.metrics.falsePositiveRates?.bins[index] !== undefined
              ) {
                return (
                  binBound.upper -
                  this.props.metrics.falsePositiveRates.bins[index]
                ); // convert from bounds to relative error
              }
              return 0;
            }
          ) || [0],
          arrayminus: this.props.metrics.falsePositiveRates.binBounds?.map(
            (binBound, index) => {
              if (
                this.props.metrics.falsePositiveRates?.bins[index] !== undefined
              ) {
                return (
                  this.props.metrics.falsePositiveRates.bins[index] -
                  binBound.lower
                ); // convert from bounds to relative error
              }
              return 0;
            }
          ) || [0],
          type: "data",
          visible: true
        };
        barPlotlyProps.data[0].textposition = "none";
      }
      if (
        this.props.errorPickerProps.errorBarsEnabled &&
        this.props.metrics.falseNegativeRates !== undefined
      ) {
        barPlotlyProps.data[1].error_x = {
          array: this.props.metrics.falseNegativeRates.binBounds?.map(
            (binBound, index) => {
              if (
                this.props.metrics.falseNegativeRates?.bins[index] !== undefined
              ) {
                return (
                  (binBound.upper -
                    this.props.metrics.falseNegativeRates.bins[index]) *
                  -1
                ); // convert from bounds to relative error
              }
              return 0;
            }
          ) || [0],
          arrayminus: this.props.metrics.falseNegativeRates.binBounds?.map(
            (binBound, index) => {
              if (
                this.props.metrics.falseNegativeRates?.bins[index] !== undefined
              ) {
                return (
                  (this.props.metrics.falseNegativeRates.bins[index] -
                    binBound.lower) *
                  -1
                ); // convert from bounds to relative error
              }
              return 0;
            }
          ) || [0],
          type: "data",
          visible: true
        };
        barPlotlyProps.data[1].textposition = "none";
      }

      // Annotations for both sides of the chart
      if (barPlotlyProps.layout) {
        barPlotlyProps.layout.annotations = [
          {
            font: {
              color: theme.semanticColors.bodySubtext,
              size: 10
            },
            showarrow: false,
            text: localization.Fairness.Report.falseNegativeRate,
            x: 0.02,
            xref: "paper",
            y: 1,
            yref: "paper"
          },
          {
            font: {
              color: theme.semanticColors.bodySubtext,
              size: 10
            },
            showarrow: false,
            text: localization.Fairness.Report.falsePositiveRate,
            x: 0.98,
            xref: "paper",
            y: 1,
            yref: "paper"
          }
        ];
      }
      if (barPlotlyProps.layout?.xaxis) {
        barPlotlyProps.layout.xaxis.tickformat = ",.0%";
      }
      performanceChartCalloutHelpBarStrings = [
        localization.Fairness.Report.classificationPerformanceHowToReadV2
      ];
    }
    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.Probability
    ) {
      barPlotlyProps.data = [
        {
          color: chartColors[0],
          hoverinfo: "skip",
          name: localization.Fairness.Metrics.overprediction,
          orientation: "h",
          text: this.props.metrics.overpredictions?.bins.map((num) =>
            FormatMetrics.formatNumbers(num, "overprediction", false, 2)
          ),
          textposition: "auto",
          type: "bar",
          width: 0.5,
          x: this.props.metrics.overpredictions?.bins,
          y: groupNamesWithBuffer
        } as any,
        {
          color: chartColors[1],
          hoverinfo: "skip",
          name: localization.Fairness.Metrics.underprediction,
          orientation: "h",
          text: this.props.metrics.underpredictions?.bins.map((num) =>
            FormatMetrics.formatNumbers(num, "underprediction", false, 2)
          ),
          textposition: "auto",
          type: "bar",
          width: 0.5,
          x: this.props.metrics.underpredictions?.bins.map((x) => -1 * x),
          y: groupNamesWithBuffer
        }
      ];
      if (barPlotlyProps.layout) {
        barPlotlyProps.layout.annotations = [
          {
            font: {
              color: theme.semanticColors.bodySubtext,
              size: 10
            },
            showarrow: false,
            text: localization.Fairness.Report.underestimationError,
            x: 0.1,
            xref: "paper",
            y: 1,
            yref: "paper"
          },
          {
            font: {
              color: theme.semanticColors.bodySubtext,
              size: 10
            },
            showarrow: false,
            text: localization.Fairness.Report.overestimationError,
            x: 0.9,
            xref: "paper",
            y: 1,
            yref: "paper"
          }
        ];
      }
      performanceChartCalloutHelpBarStrings = [
        localization.Fairness.Report.probabilityPerformanceHowToRead1,
        localization.Fairness.Report.probabilityPerformanceHowToRead2,
        localization.Fairness.Report.probabilityPerformanceHowToRead3
      ];
    }
    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.Regression
    ) {
      const performanceText = this.props.metrics.predictions?.map(
        (val, index) => {
          return `${localization.formatString(
            localization.Fairness.Report.tooltipError,
            FormatMetrics.formatNumbers(
              this.props.metrics?.errors?.[index],
              "average",
              false,
              3
            )
          )}<br>${localization.formatString(
            localization.Fairness.Report.tooltipPrediction,
            FormatMetrics.formatNumbers(val, "average", false, 3)
          )}`;
        }
      );
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
          text: performanceText,
          type: "box",
          x: this.props.metrics.errors,
          y: this.props.dashboardContext.binVector.map(
            (binIndex) => groupNamesWithBuffer[binIndex]
          )
        } as any
      ];
      performanceChartCalloutHelpBarStrings = [
        localization.Fairness.Report.regressionPerformanceHowToRead
      ];
    }

    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
    ) {
      const digitsOfPrecision = 1;

      for (let j = 0; j < barPlotlyProps.data.length; j++) {
        const outcomeMetricName = barPlotlyProps.data[j].name;
        barPlotlyProps.data[j].customdata = [];
        if (barPlotlyProps.data) {
          for (
            let i = 0;
            i < this.props.dashboardContext.groupNames.length;
            i++
          ) {
            const outcomeMetric = outcomeMetricName
              ? `${outcomeMetricName}: `
              : "";
            const tempData = barPlotlyProps.data?.[j];
            const tempY = tempData ? tempData.y?.[i] : undefined;
            const tempX = tempData ? tempData.x?.[i] : undefined;

            // ensure x is number
            const x =
              tempX !== undefined && typeof tempX == "number"
                ? tempX
                : undefined;
            // ensure y is string
            const y =
              tempY !== undefined && typeof tempY == "string"
                ? tempY.trim()
                : undefined;
            const lowerErrorX =
              tempData?.error_x?.type === "data"
                ? tempData.error_x.arrayminus?.[i]
                : undefined;
            const upperErrorX =
              tempData?.error_x?.type === "data"
                ? tempData.error_x.array?.[i]
                : undefined;

            const xBounds =
              lowerErrorX !== 0 &&
              upperErrorX !== 0 &&
              typeof lowerErrorX == "number" &&
              typeof upperErrorX == "number" &&
              x !== undefined
                ? `[${(100 * (x - lowerErrorX)).toFixed(
                    digitsOfPrecision
                  )}%, ${(100 * (x + upperErrorX)).toFixed(
                    digitsOfPrecision
                  )}%]`
                : "";

            if (
              barPlotlyProps?.data?.[j]?.customdata &&
              _.isArray(barPlotlyProps.data[j].customdata)
            ) {
              barPlotlyProps.data[j].customdata!.push({
                outcomeMetric,
                x:
                  x !== undefined
                    ? (100 * x).toFixed(digitsOfPrecision)
                    : undefined,
                xBounds,
                y
              } as unknown as Datum);
            }
            barPlotlyProps.data[j].hovertemplate =
              "<b>%{customdata.y}</b><br>%{customdata.outcomeMetric}%{customdata.x}% %{customdata.xBounds}<extra></extra>";
          }
        }
      }
    }

    return (
      <Stack id="performancePlot">
        <div
          className={sharedStyles.presentationArea}
          style={{ height: `${this.props.areaHeights}px` }}
        >
          <div className={sharedStyles.chartWrapper}>
            <CalloutHelpBar
              graphCalloutStrings={performanceChartCalloutHelpBarStrings}
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
        {this.props.dashboardContext.modelMetadata.PredictionType !==
          PredictionTypes.Regression && (
          <PerformancePlotLegend
            showSubtitle={
              this.props.dashboardContext.modelMetadata.PredictionType ===
              PredictionTypes.BinaryClassification
            }
            useOverUnderPrediction={
              this.props.dashboardContext.modelMetadata.PredictionType ===
              PredictionTypes.Probability
            }
          />
        )}
      </Stack>
    );
  }
}

export interface IPerformancePlotLegendProps {
  showSubtitle: boolean;
  useOverUnderPrediction: boolean;
}
