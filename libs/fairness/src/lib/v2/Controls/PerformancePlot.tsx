// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { AccessibleChart, chartColors } from "@responsible-ai/mlchartlib";
import { getTheme } from "@uifabric/styling";
import { ITheme, Stack } from "office-ui-fabric-react";
import React from "react";

import { PredictionTypes } from "../../IFairnessProps";
import { FormatMetrics } from "../../util/FormatMetrics";
import { IFairnessContext } from "../../util/IFairnessContext";
import { performanceOptions } from "../../util/PerformanceMetrics";
import { BarPlotlyProps } from "../BarPlotlyProps";
import {
  IFeatureBinPickerPropsV2,
  IPerformancePickerPropsV2
} from "../FairnessWizard";
import { IMetrics } from "../IMetrics";
import { SharedStyles } from "../Shared.styles";

import { ModalHelp } from "./ModalHelp";
import { PerformancePlotStyles } from "./PerformancePlot.styles";
import { SummaryTable } from "./SummaryTable";

interface IPerformancePlotProps {
  dashboardContext: IFairnessContext;
  metrics: IMetrics;
  nameIndex: number[];
  theme: ITheme | undefined;
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

    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
    ) {
      // TODO don't show chart if FPR, FNR not available
      barPlotlyProps.data = [
        {
          color: chartColors[0],
          hoverinfo: "skip",
          name: localization.Fairness.Metrics.falsePositiveRate,
          orientation: "h",
          text: this.props.metrics.falsePositiveRates?.bins.map((num) =>
            FormatMetrics.formatNumbers(num, "false_positive_rate", false, 2)
          ),
          textposition: "auto",
          type: "bar",
          width: 0.5,
          x: this.props.metrics.falsePositiveRates?.bins,
          y: this.props.nameIndex
        } as any,
        {
          color: chartColors[1],
          hoverinfo: "skip",
          name: localization.Fairness.Metrics.falseNegativeRate,
          orientation: "h",
          text: this.props.metrics.falseNegativeRates?.bins.map((num) =>
            FormatMetrics.formatNumbers(num, "false_negative_rate", false, 2)
          ),
          textposition: "auto",
          type: "bar",
          width: 0.5,
          x: this.props.metrics.falseNegativeRates?.bins.map((x) => -1 * x),
          y: this.props.nameIndex
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
      // TODO don't show chart if Overprediction/Underprediction not available
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
          y: this.props.nameIndex
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
          y: this.props.nameIndex
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
      // TODO don't show chart if errors not available
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
          y: this.props.dashboardContext.binVector
        } as any
      ];
      performanceChartModalHelpStrings = [
        localization.Fairness.Report.regressionPerformanceHowToRead
      ];
    }

    const performanceKey = this.props.performancePickerProps
      .selectedPerformanceKey;
    const formattedBinPerformanceValues = this.props.metrics.performance.bins.map(
      (value) => FormatMetrics.formatNumbers(value, performanceKey)
    );
    const selectedMetric =
      performanceOptions[
        this.props.performancePickerProps.selectedPerformanceKey
      ] ||
      this.props.performancePickerProps.performanceOptions.find(
        (metric) =>
          metric.key ===
          this.props.performancePickerProps.selectedPerformanceKey
      );

    return (
      <Stack>
        {/* chart header not needed due to dropdown
        <Label>{performanceChartHeaderString}</Label> */}
        <div
          className={sharedStyles.presentationArea}
          style={{ height: `${this.props.areaHeights}px` }}
        >
          <SummaryTable
            binGroup={
              this.props.dashboardContext.modelMetadata.featureNames[
                this.props.featureBinPickerProps.selectedBinIndex
              ]
            }
            binLabels={this.props.dashboardContext.groupNames}
            formattedBinValues={formattedBinPerformanceValues}
            metricLabel={selectedMetric.title}
            binValues={this.props.metrics.performance.bins}
          />
          <div className={sharedStyles.chartWrapper}>
            <Stack horizontal={true} horizontalAlign={"space-between"}>
              <div className={sharedStyles.chartSubHeader}></div>
              <ModalHelp
                theme={theme}
                strings={performanceChartModalHelpStrings}
              />
            </Stack>
            <div className={sharedStyles.chartBody}>
              <AccessibleChart plotlyProps={barPlotlyProps} theme={undefined} />
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

interface IPerformancePlotLegendProps {
  showSubtitle: boolean;
  useOverUnderPrediction: boolean;
}

export class PerformancePlotLegend extends React.PureComponent<
  IPerformancePlotLegendProps
> {
  public render(): React.ReactNode {
    const styles = PerformancePlotStyles();
    const sharedStyles = SharedStyles();

    return (
      <Stack
        horizontal={true}
        tokens={{ childrenGap: "l1", padding: "0 0 0 0" }}
      >
        <div className={sharedStyles.textRow}>
          <div
            className={sharedStyles.colorBlock}
            style={{ backgroundColor: chartColors[1] }}
          />
          <div>
            <div className={styles.legendTitle}>
              {this.props.useOverUnderPrediction
                ? localization.Fairness.Report.underestimationError
                : localization.Fairness.Report.falseNegativeRate}
            </div>
            {this.props.showSubtitle && (
              <div className={styles.legendSubtitle}>
                {localization.Fairness.Report.underpredictionExplanation}
              </div>
            )}
          </div>
        </div>
        <div className={sharedStyles.textRow}>
          <div
            className={sharedStyles.colorBlock}
            style={{ backgroundColor: chartColors[0] }}
          />
          <div>
            <div className={styles.legendTitle}>
              {this.props.useOverUnderPrediction
                ? localization.Fairness.Report.overestimationError
                : localization.Fairness.Report.falsePositiveRate}
            </div>
            {this.props.showSubtitle && (
              <div className={styles.legendSubtitle}>
                {localization.Fairness.Report.overpredictionExplanation}
              </div>
            )}
          </div>
        </div>
      </Stack>
    );
  }
}
