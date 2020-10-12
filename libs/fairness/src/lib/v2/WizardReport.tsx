// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@uifabric/styling";
import {
  IDropdownStyles,
  IDropdownOption,
  Dropdown,
  Icon
} from "office-ui-fabric-react";
import {
  ActionButton} from "office-ui-fabric-react/lib/Button";
import { Spinner, SpinnerSize } from "office-ui-fabric-react/lib/Spinner";
import { Text } from "office-ui-fabric-react/lib/Text";
import React from "react";

import { IMetricResponse, PredictionTypes } from "../IFairnessProps";
import { chartColors } from "../util/chartColors";
import { FormatMetrics } from "../util/FormatMetrics";
import { ParityModes, parityOptions } from "../util/ParityMetrics";
import { performanceOptions } from "../util/PerformanceMetrics";

import { localization } from "./../Localization/localization";
import { ModalHelp } from "./Controls/ModalHelp";
import { IModelComparisonProps } from "./Controls/ModelComparisonChart";
import { OutcomePlot } from "./Controls/OutcomePlot";
import { OverallTable } from "./Controls/OverallTable";
import { PerformancePlot } from "./Controls/PerformancePlot";
import { IMetrics } from "./IMetrics";
import { WizardReportStyles } from "./WizardReport.styles";

export interface IState {
  metrics?: IMetrics;
  featureKey?: string;
  showModalHelp?: boolean;
  expandAttributes: boolean;
}

export interface IReportProps extends IModelComparisonProps {
  selectedModelIndex: number;
}

export class WizardReport extends React.PureComponent<IReportProps, IState> {
  public render(): React.ReactNode {
    const theme = getTheme();
    const styles = WizardReportStyles();
    const dropdownStyles: Partial<IDropdownStyles> = {
      dropdown: { width: 180 },
      title: { borderRadius: "5px", borderWidth: "1px" }
    };

    const featureOptions: IDropdownOption[] = this.props.dashboardContext.modelMetadata.featureNames.map(
      (x) => {
        return { key: x, text: x };
      }
    );

    const alternateHeight =
      this.props.featureBinPickerProps.featureBins[
        this.props.featureBinPickerProps.selectedBinIndex
      ].labelArray.length *
        60 +
      106;
    const areaHeights = Math.max(300, alternateHeight);

    const nameIndex = this.props.dashboardContext.groupNames.map((_, i) => i);
    let performanceChartModalHelpStrings: string[] = [];
    let outcomeChartModalHelpStrings: string[] = [];

    const performanceKey = this.props.performancePickerProps
      .selectedPerformanceKey;
    const disparityKey = this.props.parityPickerProps.selectedParityKey;
    const outcomeKey: string =
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
        ? "selection_rate"
        : "average";

    let mainChart;
    if (!this.state || !this.state.metrics) {
      this.loadData();
      mainChart = (
        <Spinner
          className={styles.spinner}
          size={SpinnerSize.large}
          label={localization.calculating}
        />
      );
    } else {
      if (
        this.props.dashboardContext.modelMetadata.PredictionType ===
        PredictionTypes.BinaryClassification
      ) {
        performanceChartModalHelpStrings = [
          localization.Report.classificationPerformanceHowToReadV2
        ];
        outcomeChartModalHelpStrings = [
          localization.Report.classificationOutcomesHowToRead
        ];
      }
      if (
        this.props.dashboardContext.modelMetadata.PredictionType ===
        PredictionTypes.Probability
      ) {
        performanceChartModalHelpStrings = [
          localization.Report.probabilityPerformanceHowToRead1,
          localization.Report.probabilityPerformanceHowToRead2,
          localization.Report.probabilityPerformanceHowToRead3
        ];
        outcomeChartModalHelpStrings = [
          localization.Report.regressionOutcomesHowToRead
        ];
      }
      if (
        this.props.dashboardContext.modelMetadata.PredictionType ===
        PredictionTypes.Regression
      ) {
        performanceChartModalHelpStrings = [
          localization.Report.regressionPerformanceHowToRead
        ];
        outcomeChartModalHelpStrings = [
          localization.Report.regressionOutcomesHowToRead
        ];
      }

      // define task-specific metrics to show by default
      const additionalMetrics: Map<string, IMetricResponse> = new Map();

      switch (this.props.dashboardContext.modelMetadata.PredictionType) {
        case PredictionTypes.BinaryClassification: {
          if (this.state.metrics.falsePositiveRates) {
            additionalMetrics.set(
              "false_positive_rate",
              this.state.metrics.falsePositiveRates
            );
          }
          if (this.state.metrics.falseNegativeRates) {
            additionalMetrics.set(
              "false_negative_rate",
              this.state.metrics.falseNegativeRates
            );
          }
          break;
        }
        case PredictionTypes.Probability: {
          if (this.state.metrics.overpredictions) {
            additionalMetrics.set(
              "overprediction",
              this.state.metrics.overpredictions
            );
          }
          if (this.state.metrics.underpredictions) {
            additionalMetrics.set(
              "underprediction",
              this.state.metrics.underpredictions
            );
          }
          break;
        }
        case PredictionTypes.Regression: {
          // TODO: define additional metrics for regression
          break;
        }
        default: {
          throw new Error(
            `Unexpected task type ${this.props.dashboardContext.modelMetadata.PredictionType}.`
          );
        }
      }

      const globalPerformanceString = FormatMetrics.formatNumbers(
        this.state.metrics.performance.global,
        performanceKey
      );
      // const disparityPerformanceString = FormatMetrics.formatNumbers(
      //   this.state.metrics.performanceDisparity,
      //   performanceKey
      // );

      const globalOutcomeString = FormatMetrics.formatNumbers(
        this.state.metrics.outcomes.global,
        outcomeKey
      );
      const disparityOutcomeString = FormatMetrics.formatNumbers(
        this.state.metrics.outcomeDisparity,
        disparityKey
      );

      const formattedBinPerformanceValues = this.state.metrics.performance.bins.map(
        (value) => FormatMetrics.formatNumbers(value, performanceKey)
      );
      const formattedBinOutcomeValues = this.state.metrics.outcomes.bins.map(
        (value) => FormatMetrics.formatNumbers(value, outcomeKey)
      );

      // set the table columns to consist of performance and outcome as well
      // as any additional metrics that may be relevant for the selected task
      const formattedBinValues = [
        formattedBinPerformanceValues,
        formattedBinOutcomeValues,
        formattedBinOutcomeValues.map((_) => "")  // empty entries for disparity outcome column
      ];
      additionalMetrics.forEach((metricObject, metricName) => {
        formattedBinValues.push(
          metricObject?.bins.map((value) => {
            return FormatMetrics.formatNumbers(value, metricName);
          })
        );
      });

      const overallMetrics = [globalPerformanceString, globalOutcomeString, disparityOutcomeString];
      additionalMetrics.forEach((metricObject, metricName) => {
        overallMetrics.push(
          FormatMetrics.formatNumbers(metricObject?.global, metricName)
        );
      });

      const metricLabels = [
        (
          this.props.performancePickerProps.performanceOptions.find(
            (a) => a.key === performanceKey
          ) || performanceOptions[performanceKey]
        ).title,
        performanceOptions[outcomeKey].title,
        (
          this.props.parityPickerProps.parityOptions.find(
            (a) => a.key === disparityKey
          ) || parityOptions[disparityKey]
        ).title,
      ];
      additionalMetrics.forEach((_, metricName) => {
        metricLabels.push(performanceOptions[metricName].title);
      });

      mainChart = (
        <div className={styles.main}>
          <div className={styles.mainLeft}>
            <div
              className={styles.overallArea}
              style={{
                height: this.state.expandAttributes
                  ? `${150 + 50 * (areaHeights / 150)}px`
                  : "150px"
              }}
            >
              <OverallTable
                binGroup={
                  this.props.dashboardContext.modelMetadata.featureNames[
                    this.props.featureBinPickerProps.selectedBinIndex
                  ]
                }
                binLabels={this.props.dashboardContext.groupNames}
                formattedBinValues={formattedBinValues}
                metricLabels={metricLabels}
                overallMetrics={overallMetrics}
                expandAttributes={this.state.expandAttributes}
                binValues={this.state.metrics.performance.bins}
              />
            </div>
            <div
              className={styles.expandAttributes}
              onClick={this.expandAttributes}
            >
              {(this.state.expandAttributes && (
                <Icon iconName="ChevronUp" className={styles.chevronIcon} />
              )) ||
                (!this.state.expandAttributes && (
                  <Icon iconName="ChevronDown" className={styles.chevronIcon} />
                ))}
              <Text>
                {(this.state.expandAttributes &&
                  localization.Report.collapseSensitiveAttributes) ||
                  (!this.state.expandAttributes &&
                    localization.Report.expandSensitiveAttributes)}
              </Text>
            </div>
            <div className={styles.equalizedOdds}>
              <Text>{localization.Report.equalizedOddsDisparity}</Text>
            </div>
            <ModalHelp
              theme={theme}
              strings={performanceChartModalHelpStrings}
            />
            <PerformancePlot
              dashboardContext={this.props.dashboardContext}
              metrics={this.state.metrics}
              nameIndex={nameIndex}
              theme={undefined}
              featureBinPickerProps={this.props.featureBinPickerProps}
              performancePickerProps={this.props.performancePickerProps}
              areaHeights={areaHeights}
            />
            <div className={styles.legendPanel}>
              <div className={styles.textRow}>
                <div
                  className={styles.colorBlock}
                  style={{ backgroundColor: chartColors[1] }}
                />
                <div>
                  <div className={styles.legendTitle}>
                    {localization.Report.underestimationError}
                  </div>
                  <div className={styles.legendSubtitle}>
                    {localization.Report.underpredictionExplanation}
                  </div>
                </div>
              </div>
              <div className={styles.textRow}>
                <div
                  className={styles.colorBlock}
                  style={{ backgroundColor: chartColors[0] }}
                />
                <div>
                  <div className={styles.legendTitle}>
                    {localization.Report.overestimationError}
                  </div>
                  <div className={styles.legendSubtitle}>
                    {localization.Report.overpredictionExplanation}
                  </div>
                </div>
              </div>
            </div>
            <ModalHelp
              theme={theme}
              strings={outcomeChartModalHelpStrings}
            />
            <OutcomePlot
              dashboardContext={this.props.dashboardContext}
              metrics={this.state.metrics}
              nameIndex={nameIndex}
              theme={undefined}
              featureBinPickerProps={this.props.featureBinPickerProps}
              areaHeights={areaHeights}
            />
          </div>
        </div>
      );
    }

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
                {localization.Report.backToComparisons}
              </ActionButton>
            </div>
          )}
          <div className={styles.modelLabel}>
            {localization.Report.assessmentResults}{" "}
            <b>
              {
                this.props.dashboardContext.modelNames[
                  this.props.selectedModelIndex
                ]
              }
            </b>
          </div>
          <div className={styles.headerOptions}>
            <Dropdown
              className={styles.dropDown}
              // label="Feature"
              defaultSelectedKey={
                this.props.dashboardContext.modelMetadata.featureNames[
                  this.props.featureBinPickerProps.selectedBinIndex
                ]
              }
              options={featureOptions}
              disabled={false}
              onChange={this.featureChanged}
              styles={dropdownStyles}
            />
          </div>
        </div>
        {mainChart}
      </div>
    );
  }

  private readonly clearModelSelection = (): void => {
    if (this.props.onChartClick) {
      this.props.onChartClick();
    }
  };

  private readonly expandAttributes = (): void => {
    this.setState({ expandAttributes: !this.state.expandAttributes });
  };

  // private readonly onEditConfigs = (): void => {
  //   if (this.props.modelCount > 1) {
  //     this.props.onChartClick(undefined);
  //   }
  //   this.props.onEditConfigs();
  // };

  private readonly featureChanged = (
    _: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (!option) {
      return;
    }
    const featureKey = option.key.toString();
    if (this.state.featureKey !== featureKey) {
      this.props.featureBinPickerProps.selectedBinIndex = this.props.dashboardContext.modelMetadata.featureNames.indexOf(
        featureKey
      );
      this.setState({ featureKey, metrics: undefined });
    }
  };

  private async loadData(): Promise<void> {
    try {
      let falsePositiveRates: IMetricResponse | undefined;
      let falseNegativeRates: IMetricResponse | undefined;
      let overpredictions: IMetricResponse | undefined;
      let underpredictions: IMetricResponse | undefined;
      let predictions: number[] | undefined;
      let errors: number[] | undefined;
      let outcomes: IMetricResponse;
      let outcomeDisparity: number;
      const performance = await this.getMetric(
        this.props.performancePickerProps.selectedPerformanceKey
      );
      const performanceDisparity = await this.getDisparityMetric(
        this.props.performancePickerProps.selectedPerformanceKey,
        ParityModes.Difference
      );
      switch (this.props.dashboardContext.modelMetadata.PredictionType) {
        case PredictionTypes.BinaryClassification: {
          falseNegativeRates = await this.getMetric("false_negative_rate");
          falsePositiveRates = await this.getMetric("false_positive_rate");
          outcomes = await this.getMetric("selection_rate");
          outcomeDisparity = await this.getDisparityMetric(
            "selection_rate",
            ParityModes.Difference
          );
          break;
        }
        case PredictionTypes.Probability: {
          predictions = this.props.dashboardContext.predictions[
            this.props.selectedModelIndex
          ];
          overpredictions = await this.getMetric("overprediction");
          underpredictions = await this.getMetric("underprediction");
          outcomes = await this.getMetric("average");
          outcomeDisparity = await this.getDisparityMetric(
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
          outcomes = await this.getMetric("average");
          outcomeDisparity = await this.getDisparityMetric(
            "average",
            ParityModes.Difference
          );
          break;
        }
      }
      this.setState({
        metrics: {
          errors,
          falseNegativeRates,
          falsePositiveRates,
          outcomeDisparity,
          outcomes,
          overpredictions,
          performance,
          performanceDisparity,
          predictions,
          underpredictions
        }
      });
    } catch {
      // todo;
    }
  }

  private async getMetric(metricName: string): Promise<IMetricResponse> {
    return await this.props.metricsCache.getMetric(
      this.props.dashboardContext.binVector,
      this.props.featureBinPickerProps.selectedBinIndex,
      this.props.selectedModelIndex,
      metricName
    );
  }

  private async getDisparityMetric(
    metricName: string,
    parityMode: ParityModes
  ): Promise<number> {
    return await this.props.metricsCache.getDisparityMetric(
      this.props.dashboardContext.binVector,
      this.props.featureBinPickerProps.selectedBinIndex,
      this.props.selectedModelIndex,
      metricName,
      parityMode
    );
  }
}
