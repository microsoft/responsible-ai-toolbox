// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  AccessibleChart,
  IPlotlyProperty,
  chartColors
} from "@responsible-ai/mlchartlib";
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
import { FairnessModes } from "../util/FairnessMetrics";
import { FormatMetrics } from "../util/FormatMetrics";
import { performanceOptions } from "../util/PerformanceMetrics";

import { IModelComparisonProps } from "./Controls/ModelComparisonChart";
import { SummaryTable } from "./Controls/SummaryTable";
import { WizardReportStyles } from "./WizardReport.styles";

const theme = getTheme();
interface IMetrics {
  globalPerformance: number;
  binnedPerformance: number[];
  performanceFairness: number;
  globalOutcome: number;
  outcomeFairness: number;
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
      ],
      responsive: true
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
      hovermode: "closest",
      margin: {
        b: 20,
        l: 0,
        r: 0,
        t: 4
      },
      plot_bgcolor: theme.semanticColors.bodyFrameBackground,
      showlegend: false,
      xaxis: {
        autorange: true,
        fixedrange: true,
        linecolor: theme.semanticColors.disabledBorder,
        linewidth: 1,
        mirror: true
      },
      yaxis: {
        autorange: "reversed",
        dtick: 1,
        fixedrange: true,
        gridcolor: theme.semanticColors.disabledBorder,
        gridwidth: 1,
        showgrid: true,
        showticklabels: false,
        tick0: 0.5
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
          label={localization.Fairness.calculating}
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

    const performanceKey = this.props.performancePickerProps
      .selectedPerformanceKey;
    const outcomeKey =
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
        ? "selection_rate"
        : "average";
    const outcomeMetric = performanceOptions[outcomeKey];

    const performancePlot = _.cloneDeep(WizardReport.barPlotlyProps);
    const opportunityPlot = _.cloneDeep(WizardReport.barPlotlyProps);
    const nameIndex = this.props.dashboardContext.groupNames.map((_, i) => i);
    let howToReadPerformanceSection: React.ReactNode;
    let howToReadOutcomesSection: React.ReactNode;
    let performanceChartHeader = "";
    let opportunityChartHeader = "";

    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
    ) {
      performancePlot.data = [
        {
          fillcolor: chartColors[0],
          hoverinfo: "skip",
          name: localization.Fairness.Metrics.overprediction,
          orientation: "h",
          text: this.state.metrics.binnedOverprediction?.map((num) =>
            FormatMetrics.formatNumbers(num, "accuracy_score", false, 2)
          ),
          textposition: "inside",
          type: "bar",
          width: 0.5,
          x: this.state.metrics.binnedOverprediction,
          y: nameIndex
        },
        {
          fillcolor: chartColors[1],
          hoverinfo: "skip",
          name: localization.Fairness.Metrics.underprediction,
          orientation: "h",
          text: this.state.metrics.binnedUnderprediction?.map((num) =>
            FormatMetrics.formatNumbers(num, "accuracy_score", false, 2)
          ),
          textfont: { color: theme.palette.black },
          textposition: "inside",
          type: "bar",
          width: 0.5,
          x: this.state.metrics.binnedUnderprediction?.map((x) => -1 * x),
          y: nameIndex
        }
      ];
      if (performancePlot.layout) {
        performancePlot.layout.annotations = [
          {
            font: { color: theme.semanticColors.bodySubtext, size: 10 },
            showarrow: false,
            text: localization.Fairness.Report.underestimationError,
            x: 0.02,
            xref: "paper",
            y: 1,
            yref: "paper"
          },
          {
            font: { color: theme.semanticColors.bodySubtext, size: 10 },
            showarrow: false,
            text: localization.Fairness.Report.overestimationError,
            x: 0.98,
            xref: "paper",
            y: 1,
            yref: "paper"
          }
        ];
      }
      if (performancePlot.layout?.xaxis) {
        performancePlot.layout.xaxis.tickformat = ",.0%";
      }
      opportunityPlot.data = [
        {
          fillcolor: chartColors[0],
          hoverinfo: "skip",
          name: outcomeMetric.title,
          orientation: "h",
          text: this.state.metrics.binnedOutcome.map((num) =>
            FormatMetrics.formatNumbers(num, "selection_rate", false, 2)
          ),
          textposition: "inside",
          type: "bar",
          x: this.state.metrics.binnedOutcome,
          y: nameIndex
        }
      ];
      if (opportunityPlot.layout?.xaxis) {
        opportunityPlot.layout.xaxis.tickformat = ",.0%";
      }
      howToReadPerformanceSection = (
        <div className={styles.rightText}>
          <div className={styles.textRow}>
            <div
              className={styles.colorBlock}
              style={{ backgroundColor: chartColors[1] }}
            />
            <div>
              <Text block>
                {localization.Fairness.Report.underestimationError}
              </Text>
              <Text block>
                {localization.Fairness.Report.underpredictionExplanation}
              </Text>
            </div>
          </div>
          <div className={styles.textRow}>
            <div
              className={styles.colorBlock}
              style={{ backgroundColor: chartColors[0] }}
            />
            <div>
              <Text block>
                {localization.Fairness.Report.overestimationError}
              </Text>
              <Text block>
                {localization.Fairness.Report.overpredictionExplanation}
              </Text>
            </div>
          </div>
          <Text block>
            {localization.Fairness.Report.classificationPerformanceHowToRead1}
          </Text>
          <Text block>
            {localization.Fairness.Report.classificationPerformanceHowToRead2}
          </Text>
          <Text block>
            {localization.Fairness.Report.classificationPerformanceHowToRead3}
          </Text>
        </div>
      );
      howToReadOutcomesSection = (
        <Text className={styles.textRow} block>
          {localization.Fairness.Report.classificationOutcomesHowToRead}
        </Text>
      );
    }
    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.Probability
    ) {
      performancePlot.data = [
        {
          fillcolor: chartColors[0],
          hoverinfo: "skip",
          name: localization.Fairness.Metrics.overprediction,
          orientation: "h",
          text: this.state.metrics.binnedOverprediction?.map((num) =>
            FormatMetrics.formatNumbers(num, "overprediction", false, 2)
          ),
          textposition: "inside",
          type: "bar",
          width: 0.5,
          x: this.state.metrics.binnedOverprediction,
          y: nameIndex
        },
        {
          fillcolor: chartColors[1],
          hoverinfo: "skip",
          name: localization.Fairness.Metrics.underprediction,
          orientation: "h",
          text: this.state.metrics.binnedUnderprediction?.map((num) =>
            FormatMetrics.formatNumbers(num, "underprediction", false, 2)
          ),
          textfont: { color: theme.palette.black },
          textposition: "inside",
          type: "bar",
          width: 0.5,
          x: this.state.metrics.binnedUnderprediction?.map((x) => -1 * x),
          y: nameIndex
        }
      ];
      if (performancePlot.layout) {
        performancePlot.layout.annotations = [
          {
            font: { color: theme.semanticColors.bodyText, size: 10 },
            showarrow: false,
            text: localization.Fairness.Report.underestimationError,
            x: 0.1,
            xref: "paper",
            y: 1,
            yref: "paper"
          },
          {
            font: { color: theme.semanticColors.bodyText, size: 10 },
            showarrow: false,
            text: localization.Fairness.Report.overestimationError,
            x: 0.9,
            xref: "paper",
            y: 1,
            yref: "paper"
          }
        ];
      }
      const opportunityText = this.state.metrics.predictions?.map((val) => {
        return localization.formatString(
          localization.Fairness.Report.tooltipPrediction,
          FormatMetrics.formatNumbers(val, "average", false, 3)
        );
      });
      opportunityPlot.data = [
        {
          boxmean: true,
          boxpoints: "all",
          color: chartColors[0],
          hoverinfo: "text",
          hoveron: "points",
          jitter: 0.4,
          orientation: "h",
          pointpos: 0,
          text: opportunityText,
          type: "box",
          x: this.state.metrics.predictions,
          y: this.props.dashboardContext.binVector
        } as any
      ];
      howToReadPerformanceSection = (
        <div>
          <div className={styles.textRow}>
            <div
              className={styles.colorBlock}
              style={{ backgroundColor: chartColors[0] }}
            />
            <Text block>
              {localization.Fairness.Report.overestimationError}
            </Text>
          </div>
          <div className={styles.textRow}>
            <div
              className={styles.colorBlock}
              style={{ backgroundColor: chartColors[1] }}
            />
            <Text block>
              {localization.Fairness.Report.underestimationError}
            </Text>
          </div>
          <Text className={styles.textRow} block>
            {localization.Fairness.Report.probabilityPerformanceHowToRead1}
          </Text>
          <Text className={styles.textRow} block>
            {localization.Fairness.Report.probabilityPerformanceHowToRead2}
          </Text>
          <Text className={styles.textRow} block>
            {localization.Fairness.Report.probabilityPerformanceHowToRead3}
          </Text>
        </div>
      );
      howToReadOutcomesSection = (
        <div>
          <Text className={styles.textRow} block>
            {localization.Fairness.Report.regressionOutcomesHowToRead}
          </Text>
        </div>
      );
      opportunityChartHeader =
        localization.Fairness.Report.distributionOfPredictions;
    }
    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.Regression
    ) {
      const opportunityText = this.state.metrics.predictions?.map((val) => {
        return localization.formatString(
          localization.Fairness.Report.tooltipPrediction,
          val
        );
      });
      const performanceText = this.state.metrics.predictions?.map(
        (val, index) => {
          return `${localization.formatString(
            localization.Fairness.Report.tooltipError,
            FormatMetrics.formatNumbers(
              this.state.metrics?.errors
                ? this.state.metrics.errors[index]
                : undefined,
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
      performancePlot.data = [
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
          x: this.state.metrics.errors,
          y: this.props.dashboardContext.binVector
        } as any
      ];
      opportunityPlot.data = [
        {
          boxmean: true,
          boxpoints: "all",
          color: chartColors[0],
          hoverinfo: "text",
          hoveron: "points",
          jitter: 0.4,
          orientation: "h",
          pointpos: 0,
          text: opportunityText,
          type: "box",
          x: this.state.metrics.predictions,
          y: this.props.dashboardContext.binVector
        } as any
      ];
      howToReadPerformanceSection = (
        <div>
          <Text className={styles.textRow} block>
            {localization.Fairness.Report.regressionPerformanceHowToRead}
          </Text>
        </div>
      );
      howToReadOutcomesSection = (
        <div>
          <Text className={styles.textRow} block>
            {localization.Fairness.Report.regressionOutcomesHowToRead}
          </Text>
        </div>
      );
      opportunityChartHeader =
        localization.Fairness.Report.distributionOfPredictions;
      performanceChartHeader =
        localization.Fairness.Report.distributionOfErrors;
    }

    const globalPerformanceString = FormatMetrics.formatNumbers(
      this.state.metrics.globalPerformance,
      performanceKey
    );
    const fairnessPerformanceString = FormatMetrics.formatNumbers(
      this.state.metrics.performanceFairness,
      performanceKey
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

    const globalOutcomeString = FormatMetrics.formatNumbers(
      this.state.metrics.globalOutcome,
      outcomeKey
    );
    const fairnessOutcomeString = FormatMetrics.formatNumbers(
      this.state.metrics.outcomeFairness,
      outcomeKey
    );
    const formattedBinPerformanceValues = this.state.metrics.binnedPerformance.map(
      (value) => FormatMetrics.formatNumbers(value, performanceKey)
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
                {localization.Fairness.Report.backToComparisonsLegacy}
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
            {localization.Fairness.Report.title}
          </Text>
          <div className={styles.bannerWrapper}>
            <div className={styles.headerBanner}>
              <Text className={styles.metricText} block>
                {globalPerformanceString}
              </Text>
              <Text className={styles.firstMetricLabel} block>
                {localization.formatString(
                  localization.Fairness.Report.globalPerformanceText,
                  selectedMetric.alwaysUpperCase
                    ? selectedMetric.title
                    : selectedMetric.title.toLowerCase()
                )}
              </Text>
              <Text className={styles.metricText} block>
                {fairnessPerformanceString}
              </Text>
              <Text className={styles.metricLabel} block>
                {localization.formatString(
                  localization.Fairness.Report.performanceDisparityText,
                  selectedMetric.alwaysUpperCase
                    ? selectedMetric.title
                    : selectedMetric.title.toLowerCase()
                )}
              </Text>
            </div>
            <ActionButton
              iconProps={{ iconName: "Edit" }}
              onClick={this.onEditConfigs}
            >
              {localization.Fairness.Report.editConfiguration}
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
            formattedBinValues={formattedBinPerformanceValues}
            metricLabel={selectedMetric.title}
            binValues={this.state.metrics.binnedPerformance}
          />
          <div className={styles.chartWrapper}>
            <Text variant={"small"} className={styles.chartHeader}>
              {performanceChartHeader}
            </Text>
            <div className={styles.chartBody}>
              <AccessibleChart
                plotlyProps={performancePlot}
                theme={undefined}
              />
            </div>
          </div>
          <div className={styles.mainRight}>
            <Text className={styles.rightTitle} block>
              {localization.Fairness.ModelComparison.howToRead}
            </Text>
            {howToReadPerformanceSection}
          </div>
        </div>
        <div className={styles.header}>
          <Text variant={"mediumPlus"} className={styles.headerTitle}>
            {localization.Fairness.Report.outcomesTitle}
          </Text>
          <div className={styles.bannerWrapper}>
            <div className={styles.headerBanner}>
              <Text variant={"xxLargePlus"} className={styles.metricText} block>
                {globalOutcomeString}
              </Text>
              <Text className={styles.firstMetricLabel} block>
                {localization.formatString(
                  localization.Fairness.Report.globalPerformanceText,
                  outcomeMetric.title.toLowerCase()
                )}
              </Text>
              <Text variant={"xxLargePlus"} className={styles.metricText} block>
                {fairnessOutcomeString}
              </Text>
              <Text className={styles.metricLabel} block>
                {localization.formatString(
                  localization.Fairness.Report.performanceDisparityText,
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
              {localization.Fairness.ModelComparison.howToRead}
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
      let outcomeFairness: number;
      const performance = await this.props.metricsCache.getMetric(
        this.props.dashboardContext.binVector,
        this.props.featureBinPickerProps.selectedBinIndex,
        this.props.selectedModelIndex,
        this.props.performancePickerProps.selectedPerformanceKey
      );
      const performanceFairness = await this.props.metricsCache.getFairnessMetricV1(
        this.props.dashboardContext.binVector,
        this.props.featureBinPickerProps.selectedBinIndex,
        this.props.selectedModelIndex,
        this.props.performancePickerProps.selectedPerformanceKey,
        FairnessModes.Difference
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
          outcomeFairness = await this.props.metricsCache.getFairnessMetricV1(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            this.props.selectedModelIndex,
            "selection_rate",
            FairnessModes.Difference
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
          outcomeFairness = await this.props.metricsCache.getFairnessMetricV1(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            this.props.selectedModelIndex,
            "average",
            FairnessModes.Difference
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
          outcomeFairness = await this.props.metricsCache.getFairnessMetricV1(
            this.props.dashboardContext.binVector,
            this.props.featureBinPickerProps.selectedBinIndex,
            this.props.selectedModelIndex,
            "average",
            FairnessModes.Difference
          );
          break;
        }
      }
      this.setState({
        metrics: {
          binnedOutcome: outcomes.bins,
          binnedOverprediction,
          binnedPerformance: performance.bins,
          binnedUnderprediction,
          errors,
          globalOutcome: outcomes.global,
          globalPerformance: performance.global,
          outcomeFairness,
          performanceFairness,
          predictions
        }
      });
    } catch {
      // todo;
    }
  }
}
