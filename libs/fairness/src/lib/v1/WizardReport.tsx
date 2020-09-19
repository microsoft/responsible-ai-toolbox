// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AccessibleChart, IPlotlyProperty } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import {
  getTheme,
  ActionButton,
  Spinner,
  SpinnerSize,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { IMetricResponse, PredictionTypes } from "../IFairnessProps";
import { accuracyOptions } from "../util/AccuracyMetrics";
import { chartColors } from "../util/chartColors";
import { FormatMetrics } from "../util/FormatMetrics";
import { ParityModes } from "../util/ParityMetrics";

import { localization } from "./../Localization/localization";
import { IModelComparisonProps } from "./Controls/ModelComparisonChart";
import { SummaryTable } from "./Controls/SummaryTable";
import { WizardReportStyles } from "./WizardReport.styles";

const theme = getTheme();
interface IMetrics {
  globalAccuracy: number;
  binnedAccuracy: number[];
  accuracyDisparity: number;
  globalOutcome: number;
  outcomeDisparity: number;
  binnedOutcome: number[];
  // Optional, based on model type
  binnedOverprediction?: number[];
  binnedUnderprediction?: number[];
  // different length, raw unbinned errors and predictions
  errors?: number[];
  predictions?: number[];
}

export interface IState {
  metrics?: IMetrics;
}

export interface IReportProps extends IModelComparisonProps {
  selectedModelIndex: number;
}

export class WizardReport extends React.PureComponent<IReportProps, IState> {
  private static barPlotlyProps: IPlotlyProperty = {
    config: {
      displaylogo: false,
      responsive: true,
      modeBarButtonsToRemove: [
        "toggleSpikelines",
        "hoverClosestCartesian",
        "hoverCompareCartesian",
        "zoom2d",
        "pan2d",
        "select2d",
        "lasso2d",
        "zoomIn2d",
        "zoomOut2d",
        "autoScale2d",
        "resetScale2d"
      ]
    },
    data: [
      {
        orientation: "h",
        type: "bar"
      }
    ],
    layout: {
      autosize: true,
      barmode: "relative",
      font: {
        size: 10
      },
      margin: {
        t: 4,
        l: 0,
        r: 0,
        b: 20
      },
      showlegend: false,
      hovermode: "closest",
      plot_bgcolor: theme.semanticColors.bodyFrameBackground,
      xaxis: {
        fixedrange: true,
        autorange: true,
        mirror: true,
        linecolor: theme.semanticColors.disabledBorder,
        linewidth: 1
      },
      yaxis: {
        fixedrange: true,
        showticklabels: false,
        showgrid: true,
        dtick: 1,
        tick0: 0.5,
        gridcolor: theme.semanticColors.disabledBorder,
        gridwidth: 1,
        autorange: "reversed"
      }
    } as any
  };

  public render(): React.ReactNode {
    const styles = WizardReportStyles();
    if (!this.state || !this.state.metrics) {
      this.loadData();
      return (
        <Spinner
          className={styles.spinner}
          size={SpinnerSize.large}
          label={localization.calculating}
        />
      );
    }

    const alternateHeight =
      this.props.featureBinPickerProps.featureBins[
        this.props.featureBinPickerProps.selectedBinIndex
      ].labelArray.length *
        60 +
      106;
    const areaHeights = Math.max(460, alternateHeight);

    const accuracyKey = this.props.accuracyPickerProps.selectedAccuracyKey;
    const outcomeKey =
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
        ? "selection_rate"
        : "average";
    const outcomeMetric = accuracyOptions[outcomeKey];

    const accuracyPlot = _.cloneDeep(WizardReport.barPlotlyProps);
    const opportunityPlot = _.cloneDeep(WizardReport.barPlotlyProps);
    const nameIndex = this.props.dashboardContext.groupNames.map((_, i) => i);
    let howToReadAccuracySection: React.ReactNode;
    let howToReadOutcomesSection: React.ReactNode;
    let accuracyChartHeader = "";
    let opportunityChartHeader = "";

    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
    ) {
      accuracyPlot.data = [
        {
          x: this.state.metrics.binnedOverprediction,
          y: nameIndex,
          text: this.state.metrics.binnedOverprediction?.map((num) =>
            FormatMetrics.formatNumbers(num, "accuracy_score", false, 2)
          ),
          name: localization.Metrics.overprediction,
          width: 0.5,
          fillcolor: chartColors[0],
          orientation: "h",
          type: "bar",
          hoverinfo: "skip",
          textposition: "inside"
        },
        {
          x: this.state.metrics.binnedUnderprediction?.map((x) => -1 * x),
          y: nameIndex,
          text: this.state.metrics.binnedUnderprediction?.map((num) =>
            FormatMetrics.formatNumbers(num, "accuracy_score", false, 2)
          ),
          name: localization.Metrics.underprediction,
          width: 0.5,
          fillcolor: chartColors[1],
          orientation: "h",
          type: "bar",
          hoverinfo: "skip",
          textposition: "inside",
          textfont: { color: theme.palette.black }
        }
      ];
      if (accuracyPlot.layout) {
        accuracyPlot.layout.annotations = [
          {
            text: localization.Report.underestimationError,
            x: 0.02,
            y: 1,
            yref: "paper",
            xref: "paper",
            showarrow: false,
            font: { color: theme.semanticColors.bodySubtext, size: 10 }
          },
          {
            text: localization.Report.overestimationError,
            x: 0.98,
            y: 1,
            yref: "paper",
            xref: "paper",
            showarrow: false,
            font: { color: theme.semanticColors.bodySubtext, size: 10 }
          }
        ];
      }
      if (accuracyPlot.layout?.xaxis) {
        accuracyPlot.layout.xaxis.tickformat = ",.0%";
      }
      opportunityPlot.data = [
        {
          x: this.state.metrics.binnedOutcome,
          y: nameIndex,
          text: this.state.metrics.binnedOutcome.map((num) =>
            FormatMetrics.formatNumbers(num, "selection_rate", false, 2)
          ),
          name: outcomeMetric.title,
          fillcolor: chartColors[0],
          orientation: "h",
          type: "bar",
          textposition: "inside",
          hoverinfo: "skip"
        }
      ];
      if (opportunityPlot.layout?.xaxis) {
        opportunityPlot.layout.xaxis.tickformat = ",.0%";
      }
      howToReadAccuracySection = (
        <div className={styles.rightText}>
          <div className={styles.textRow}>
            <div
              className={styles.colorBlock}
              style={{ backgroundColor: chartColors[1] }}
            />
            <div>
              <Text block>{localization.Report.underestimationError}</Text>
              <Text block>
                {localization.Report.underpredictionExplanation}
              </Text>
            </div>
          </div>
          <div className={styles.textRow}>
            <div
              className={styles.colorBlock}
              style={{ backgroundColor: chartColors[0] }}
            />
            <div>
              <Text block>{localization.Report.overestimationError}</Text>
              <Text block>{localization.Report.overpredictionExplanation}</Text>
            </div>
          </div>
          <Text block>
            {localization.Report.classificationAccuracyHowToRead1}
          </Text>
          <Text block>
            {localization.Report.classificationAccuracyHowToRead2}
          </Text>
          <Text block>
            {localization.Report.classificationAccuracyHowToRead3}
          </Text>
        </div>
      );
      howToReadOutcomesSection = (
        <Text className={styles.textRow} block>
          {localization.Report.classificationOutcomesHowToRead}
        </Text>
      );
    }
    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.Probability
    ) {
      accuracyPlot.data = [
        {
          x: this.state.metrics.binnedOverprediction,
          y: nameIndex,
          text: this.state.metrics.binnedOverprediction?.map((num) =>
            FormatMetrics.formatNumbers(num, "overprediction", false, 2)
          ),
          name: localization.Metrics.overprediction,
          width: 0.5,
          fillcolor: chartColors[0],
          orientation: "h",
          type: "bar",
          textposition: "inside",
          hoverinfo: "skip"
        },
        {
          x: this.state.metrics.binnedUnderprediction?.map((x) => -1 * x),
          y: nameIndex,
          text: this.state.metrics.binnedUnderprediction?.map((num) =>
            FormatMetrics.formatNumbers(num, "underprediction", false, 2)
          ),
          name: localization.Metrics.underprediction,
          width: 0.5,
          fillcolor: chartColors[1],
          orientation: "h",
          type: "bar",
          textposition: "inside",
          hoverinfo: "skip",
          textfont: { color: theme.palette.black }
        }
      ];
      if (accuracyPlot.layout) {
        accuracyPlot.layout.annotations = [
          {
            text: localization.Report.underestimationError,
            x: 0.1,
            y: 1,
            yref: "paper",
            xref: "paper",
            showarrow: false,
            font: { color: theme.semanticColors.bodyText, size: 10 }
          },
          {
            text: localization.Report.overestimationError,
            x: 0.9,
            y: 1,
            yref: "paper",
            xref: "paper",
            showarrow: false,
            font: { color: theme.semanticColors.bodyText, size: 10 }
          }
        ];
      }
      const opportunityText = this.state.metrics.predictions?.map((val) => {
        return localization.formatString(
          localization.Report.tooltipPrediction,
          FormatMetrics.formatNumbers(val, "average", false, 3)
        );
      });
      opportunityPlot.data = [
        {
          x: this.state.metrics.predictions,
          y: this.props.dashboardContext.binVector,
          text: opportunityText,
          type: "box",
          color: chartColors[0],
          boxmean: true,
          orientation: "h",
          boxpoints: "all",
          hoverinfo: "text",
          hoveron: "points",
          jitter: 0.4,
          pointpos: 0
        } as any
      ];
      howToReadAccuracySection = (
        <div>
          <div className={styles.textRow}>
            <div
              className={styles.colorBlock}
              style={{ backgroundColor: chartColors[0] }}
            />
            <Text block>{localization.Report.overestimationError}</Text>
          </div>
          <div className={styles.textRow}>
            <div
              className={styles.colorBlock}
              style={{ backgroundColor: chartColors[1] }}
            />
            <Text block>{localization.Report.underestimationError}</Text>
          </div>
          <Text className={styles.textRow} block>
            {localization.Report.probabilityAccuracyHowToRead1}
          </Text>
          <Text className={styles.textRow} block>
            {localization.Report.probabilityAccuracyHowToRead2}
          </Text>
          <Text className={styles.textRow} block>
            {localization.Report.probabilityAccuracyHowToRead3}
          </Text>
        </div>
      );
      howToReadOutcomesSection = (
        <div>
          <Text className={styles.textRow} block>
            {localization.Report.regressionOutcomesHowToRead}
          </Text>
        </div>
      );
      opportunityChartHeader = localization.Report.distributionOfPredictions;
    }
    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.Regression
    ) {
      const opportunityText = this.state.metrics.predictions?.map((val) => {
        return localization.formatString(
          localization.Report.tooltipPrediction,
          val
        );
      });
      const accuracyText = this.state.metrics.predictions?.map((val, index) => {
        return `${localization.formatString(
          localization.Report.tooltipError,
          FormatMetrics.formatNumbers(
            this.state.metrics?.errors
              ? this.state.metrics.errors[index]
              : undefined,
            "average",
            false,
            3
          )
        )}<br>${localization.formatString(
          localization.Report.tooltipPrediction,
          FormatMetrics.formatNumbers(val, "average", false, 3)
        )}`;
      });
      accuracyPlot.data = [
        {
          x: this.state.metrics.errors,
          y: this.props.dashboardContext.binVector,
          text: accuracyText,
          type: "box",
          color: chartColors[0],
          orientation: "h",
          boxmean: true,
          hoveron: "points",
          hoverinfo: "text",
          boxpoints: "all",
          jitter: 0.4,
          pointpos: 0
        } as any
      ];
      opportunityPlot.data = [
        {
          x: this.state.metrics.predictions,
          y: this.props.dashboardContext.binVector,
          text: opportunityText,
          type: "box",
          color: chartColors[0],
          boxmean: true,
          orientation: "h",
          hoveron: "points",
          boxpoints: "all",
          hoverinfo: "text",
          jitter: 0.4,
          pointpos: 0
        } as any
      ];
      howToReadAccuracySection = (
        <div>
          <Text className={styles.textRow} block>
            {localization.Report.regressionAccuracyHowToRead}
          </Text>
        </div>
      );
      howToReadOutcomesSection = (
        <div>
          <Text className={styles.textRow} block>
            {localization.Report.regressionOutcomesHowToRead}
          </Text>
        </div>
      );
      opportunityChartHeader = localization.Report.distributionOfPredictions;
      accuracyChartHeader = localization.Report.distributionOfErrors;
    }

    const globalAccuracyString = FormatMetrics.formatNumbers(
      this.state.metrics.globalAccuracy,
      accuracyKey
    );
    const disparityAccuracyString = FormatMetrics.formatNumbers(
      this.state.metrics.accuracyDisparity,
      accuracyKey
    );
    const selectedMetric =
      accuracyOptions[this.props.accuracyPickerProps.selectedAccuracyKey] ||
      this.props.accuracyPickerProps.accuracyOptions.find(
        (metric) =>
          metric.key === this.props.accuracyPickerProps.selectedAccuracyKey
      );

    const globalOutcomeString = FormatMetrics.formatNumbers(
      this.state.metrics.globalOutcome,
      outcomeKey
    );
    const disparityOutcomeString = FormatMetrics.formatNumbers(
      this.state.metrics.outcomeDisparity,
      outcomeKey
    );
    const formattedBinAccuracyValues = this.state.metrics.binnedAccuracy.map(
      (value) => FormatMetrics.formatNumbers(value, accuracyKey)
    );
    const formattedBinOutcomeValues = this.state.metrics.binnedOutcome.map(
      (value) => FormatMetrics.formatNumbers(value, outcomeKey)
    );
    return (
      <div style={{ height: "100%", overflowY: "auto" }}>
        <div className={styles.header}>
          {this.props.modelCount > 1 && (
            <div className={styles.multimodelSection}>
              <ActionButton
                className={styles.multimodelButton}
                iconProps={{ iconName: "ChevronLeft" }}
                onClick={this.clearModelSelection}
              >
                {localization.Report.backToComparisonsLegacy}
              </ActionButton>
              <Text variant={"large"} className={styles.modelLabel}>
                {
                  this.props.dashboardContext.modelNames[
                    this.props.selectedModelIndex
                  ]
                }
              </Text>
            </div>
          )}
          <Text variant={"mediumPlus"} className={styles.headerTitle}>
            {localization.Report.title}
          </Text>
          <div className={styles.bannerWrapper}>
            <div className={styles.headerBanner}>
              <Text className={styles.metricText} block>
                {globalAccuracyString}
              </Text>
              <Text className={styles.firstMetricLabel} block>
                {localization.formatString(
                  localization.Report.globalAccuracyText,
                  selectedMetric.alwaysUpperCase
                    ? selectedMetric.title
                    : selectedMetric.title.toLowerCase()
                )}
              </Text>
              <Text className={styles.metricText} block>
                {disparityAccuracyString}
              </Text>
              <Text className={styles.metricLabel} block>
                {localization.formatString(
                  localization.Report.accuracyDisparityText,
                  selectedMetric.alwaysUpperCase
                    ? selectedMetric.title
                    : selectedMetric.title.toLowerCase()
                )}
              </Text>
            </div>
            <ActionButton
              iconProps={{ iconName: "Edit" }}
              onClick={this.onEditConfigs}
              autoFocus={true}
            >
              {localization.Report.editConfiguration}
            </ActionButton>
          </div>
        </div>
        <div
          className={styles.presentationArea}
          style={{ height: `${areaHeights}px` }}
        >
          <SummaryTable
            binGroup={
              this.props.dashboardContext.modelMetadata.featureNames[
                this.props.featureBinPickerProps.selectedBinIndex
              ]
            }
            binLabels={this.props.dashboardContext.groupNames}
            formattedBinValues={formattedBinAccuracyValues}
            metricLabel={selectedMetric.title}
            binValues={this.state.metrics.binnedAccuracy}
          />
          <div className={styles.chartWrapper}>
            <Text variant={"small"} className={styles.chartHeader}>
              {accuracyChartHeader}
            </Text>
            <div className={styles.chartBody}>
              <AccessibleChart plotlyProps={accuracyPlot} theme={undefined} />
            </div>
          </div>
          <div className={styles.mainRight}>
            <Text className={styles.rightTitle} block>
              {localization.ModelComparison.howToRead}
            </Text>
            {howToReadAccuracySection}
          </div>
        </div>
        <div className={styles.header}>
          <Text variant={"mediumPlus"} className={styles.headerTitle}>
            {localization.Report.outcomesTitle}
          </Text>
          <div className={styles.bannerWrapper}>
            <div className={styles.headerBanner}>
              <Text variant={"xxLargePlus"} className={styles.metricText} block>
                {globalOutcomeString}
              </Text>
              <Text className={styles.firstMetricLabel} block>
                {localization.formatString(
                  localization.Report.globalAccuracyText,
                  outcomeMetric.title.toLowerCase()
                )}
              </Text>
              <Text variant={"xxLargePlus"} className={styles.metricText} block>
                {disparityOutcomeString}
              </Text>
              <Text className={styles.metricLabel} block>
                {localization.formatString(
                  localization.Report.accuracyDisparityText,
                  outcomeMetric.title.toLowerCase()
                )}
              </Text>
            </div>
          </div>
        </div>
        <div
          className={styles.presentationArea}
          style={{ height: `${areaHeights}px` }}
        >
          <SummaryTable
            binGroup={
              this.props.dashboardContext.modelMetadata.featureNames[
                this.props.featureBinPickerProps.selectedBinIndex
              ]
            }
            binLabels={this.props.dashboardContext.groupNames}
            formattedBinValues={formattedBinOutcomeValues}
            metricLabel={outcomeMetric.title}
            binValues={this.state.metrics.binnedOutcome}
          />
          <div className={styles.chartWrapper}>
            <Text variant={"small"} className={styles.chartHeader} block>
              {opportunityChartHeader}
            </Text>
            <div className={styles.chartBody}>
              <AccessibleChart
                plotlyProps={opportunityPlot}
                theme={undefined}
              />
            </div>
          </div>
          <div className={styles.mainRight}>
            <Text className={styles.rightTitle} block>
              {localization.ModelComparison.howToRead}
            </Text>
            <Text className={styles.rightText} block>
              {howToReadOutcomesSection}
            </Text>
          </div>
        </div>
      </div>
    );
  }

  private readonly clearModelSelection = (): void => {
    if (this.props.onChartClick) {
      this.props.onChartClick(undefined);
    }
  };

  private readonly onEditConfigs = (): void => {
    if (this.props.modelCount > 1) {
      if (this.props.onChartClick) {
        this.props.onChartClick(undefined);
      }
    }
    this.props.onEditConfigs();
  };

  private async loadData(): Promise<void> {
    try {
      let binnedOverprediction: number[] | undefined;
      let binnedUnderprediction: number[] | undefined;
      let predictions: number[] | undefined;
      let errors: number[] | undefined;
      let outcomes: IMetricResponse;
      let outcomeDisparity: number;
      const accuracy = await this.props.metricsCache.getMetric(
        this.props.dashboardContext.binVector,
        this.props.featureBinPickerProps.selectedBinIndex,
        this.props.selectedModelIndex,
        this.props.accuracyPickerProps.selectedAccuracyKey
      );
      const accuracyDisparity = await this.props.metricsCache.getDisparityMetric(
        this.props.dashboardContext.binVector,
        this.props.featureBinPickerProps.selectedBinIndex,
        this.props.selectedModelIndex,
        this.props.accuracyPickerProps.selectedAccuracyKey,
        ParityModes.Difference
      );
      switch (this.props.dashboardContext.modelMetadata.PredictionType) {
        case PredictionTypes.BinaryClassification: {
          binnedUnderprediction = (
            await this.props.metricsCache.getMetric(
              this.props.dashboardContext.binVector,
              this.props.featureBinPickerProps.selectedBinIndex,
              this.props.selectedModelIndex,
              "underprediction"
            )
          ).bins;
          binnedOverprediction = (
            await this.props.metricsCache.getMetric(
              this.props.dashboardContext.binVector,
              this.props.featureBinPickerProps.selectedBinIndex,
              this.props.selectedModelIndex,
              "overprediction"
            )
          ).bins;
          outcomes = await this.props.metricsCache.getMetric(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            this.props.selectedModelIndex,
            "selection_rate"
          );
          outcomeDisparity = await this.props.metricsCache.getDisparityMetric(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            this.props.selectedModelIndex,
            "selection_rate",
            ParityModes.Difference
          );
          break;
        }
        case PredictionTypes.Probability: {
          predictions = this.props.dashboardContext.predictions[
            this.props.selectedModelIndex
          ];
          binnedOverprediction = (
            await this.props.metricsCache.getMetric(
              this.props.dashboardContext.binVector,
              this.props.featureBinPickerProps.selectedBinIndex,
              this.props.selectedModelIndex,
              "overprediction"
            )
          ).bins;
          binnedUnderprediction = (
            await this.props.metricsCache.getMetric(
              this.props.dashboardContext.binVector,
              this.props.featureBinPickerProps.selectedBinIndex,
              this.props.selectedModelIndex,
              "underprediction"
            )
          ).bins;
          outcomes = await this.props.metricsCache.getMetric(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            this.props.selectedModelIndex,
            "average"
          );
          outcomeDisparity = await this.props.metricsCache.getDisparityMetric(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            this.props.selectedModelIndex,
            "average",
            ParityModes.Difference
          );
          break;
        }
        case PredictionTypes.Regression:
        default: {
          predictions = this.props.dashboardContext.predictions[
            this.props.selectedModelIndex
          ];
          errors = predictions.map((predicted, index) => {
            return predicted - this.props.dashboardContext.trueY[index];
          });
          outcomes = await this.props.metricsCache.getMetric(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            this.props.selectedModelIndex,
            "average"
          );
          outcomeDisparity = await this.props.metricsCache.getDisparityMetric(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            this.props.selectedModelIndex,
            "average",
            ParityModes.Difference
          );
          break;
        }
      }
      this.setState({
        metrics: {
          globalAccuracy: accuracy.global,
          binnedAccuracy: accuracy.bins,
          accuracyDisparity,
          globalOutcome: outcomes.global,
          binnedOutcome: outcomes.bins,
          outcomeDisparity,
          predictions,
          errors,
          binnedOverprediction,
          binnedUnderprediction
        }
      });
    } catch {
      // todo;
    }
  }
}
