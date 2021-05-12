// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PredictionTypes } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { AccessibleChart, chartColors } from "@responsible-ai/mlchartlib";
import { getTheme, Stack } from "office-ui-fabric-react";
import React from "react";

import { BarPlotlyProps } from "../BarPlotlyProps";
import {
  IFeatureBinPickerPropsV2,
  IPerformancePickerPropsV2
} from "../FairnessWizard";
import { IMetrics } from "../IMetrics";
import { SharedStyles } from "../Shared.styles";

import { FormatMetrics } from "./../util/FormatMetrics";
import { IFairnessContext } from "./../util/IFairnessContext";
import { ModalHelp } from "./ModalHelp";
import { PerformancePlotLegend } from "./PerformancePlotLegend";

interface IPerformancePlotProps {
  dashboardContext: IFairnessContext;
  metrics: IMetrics;
  areaHeights: number;
  performancePickerProps: IPerformancePickerPropsV2;
  featureBinPickerProps: IFeatureBinPickerPropsV2;
}

export class PerformancePlot extends React.PureComponent<
  IPerformancePlotProps
> {
  public render(): React.ReactNode {
    const barPlotlyProps = new BarPlotlyProps();
    const theme = getTheme();
    const sharedStyles = SharedStyles();
    let performanceChartModalHelpStrings: string[] = [];
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
      performanceChartModalHelpStrings = [
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
      performanceChartModalHelpStrings = [
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
      performanceChartModalHelpStrings = [
        localization.Fairness.Report.regressionPerformanceHowToRead
      ];
    }

    return (
      <Stack id="performancePlot">
        <div
          className={sharedStyles.presentationArea}
          style={{ height: `${this.props.areaHeights}px` }}
        >
          <div className={sharedStyles.chartWrapper}>
            <Stack horizontal horizontalAlign={"space-between"}>
              <div className={sharedStyles.chartSubHeader} />
              <ModalHelp
                theme={theme}
                strings={performanceChartModalHelpStrings}
              />
            </Stack>
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
