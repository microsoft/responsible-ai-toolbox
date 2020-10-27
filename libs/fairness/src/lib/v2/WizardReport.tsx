// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { Dictionary } from "lodash";
import { IDropdownOption, Icon, Stack } from "office-ui-fabric-react";
import { ActionButton } from "office-ui-fabric-react/lib/Button";
import { Spinner, SpinnerSize } from "office-ui-fabric-react/lib/Spinner";
import { Text } from "office-ui-fabric-react/lib/Text";
import React from "react";

import { IMetricResponse, PredictionTypes } from "../IFairnessProps";
import { FormatMetrics } from "../util/FormatMetrics";
import { ParityModes, parityOptions } from "../util/ParityMetrics";
import { performanceOptions } from "../util/PerformanceMetrics";

import { DropdownBar } from "./Controls/DropdownBar";
import { IModelComparisonProps } from "./Controls/ModelComparisonChart";
import { OutcomePlot } from "./Controls/OutcomePlot";
import { OverallTable } from "./Controls/OverallTable";
import { PerformancePlot } from "./Controls/PerformancePlot";
import { IMetrics } from "./IMetrics";
import { SharedStyles } from "./Shared.styles";
import { WizardReportStyles } from "./WizardReport.styles";

export interface IState {
  metrics?: IMetrics;
  featureKey?: string;
  parityKey?: string;
  performanceKey?: string;
  showModalHelp?: boolean;
  expandAttributes: boolean;
}

export interface IReportProps extends IModelComparisonProps {
  selectedModelIndex: number;
}

export class WizardReport extends React.PureComponent<IReportProps, IState> {
  public render(): React.ReactNode {
    const styles = WizardReportStyles();
    const sharedStyles = SharedStyles();

    const alternateHeight =
      this.props.featureBinPickerProps.featureBins[
        this.props.featureBinPickerProps.selectedBinIndex
      ].labelArray.length *
        60 +
      106;
    const areaHeights = Math.max(300, alternateHeight);

    const nameIndex = this.props.dashboardContext.groupNames.map((_, i) => i);

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
          label={localization.Fairness.calculating}
        />
      );
    } else {
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

      const disparityMetricString = FormatMetrics.formatNumbers(
        this.state.metrics.disparities[
          this.props.parityPickerProps.selectedParityKey
        ],
        performanceKey
      );

      const globalOutcomeString = FormatMetrics.formatNumbers(
        this.state.metrics.outcomes.global,
        outcomeKey
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
        formattedBinOutcomeValues.map(() => "") // empty entries for disparity outcome column
      ];
      additionalMetrics.forEach((metricObject, metricName) => {
        formattedBinValues.push(
          metricObject?.bins.map((value) => {
            return FormatMetrics.formatNumbers(value, metricName);
          })
        );
      });

      const overallMetrics = [
        globalPerformanceString,
        globalOutcomeString,
        disparityMetricString
      ];
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
        ).title
      ];
      additionalMetrics.forEach((_, metricName) => {
        metricLabels.push(performanceOptions[metricName].title);
      });

      mainChart = (
        <Stack horizontal={true}>
          <Stack.Item className={sharedStyles.mainLeft}>
            <Stack tokens={{ childrenGap: "l1" }}>
              <Stack horizontal={true}>
                <Stack>
                  <div
                    className={styles.overallArea}
                    style={{
                      height: this.state.expandAttributes
                        ? `${150 + 50 * (areaHeights / 150)}px`
                        : "97px"
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
                      <Icon
                        iconName="ChevronUp"
                        className={styles.chevronIcon}
                      />
                    )) ||
                      (!this.state.expandAttributes && (
                        <Icon
                          iconName="ChevronDown"
                          className={styles.chevronIcon}
                        />
                      ))}
                    <Text>
                      {(this.state.expandAttributes &&
                        localization.Fairness.Report
                          .collapseSensitiveAttributes) ||
                        (!this.state.expandAttributes &&
                          localization.Fairness.Report
                            .expandSensitiveAttributes)}
                    </Text>
                  </div>
                </Stack>
              </Stack>
              <PerformancePlot
                dashboardContext={this.props.dashboardContext}
                metrics={this.state.metrics}
                nameIndex={nameIndex}
                theme={undefined}
                featureBinPickerProps={this.props.featureBinPickerProps}
                performancePickerProps={this.props.performancePickerProps}
                areaHeights={areaHeights}
              />
              <OutcomePlot
                dashboardContext={this.props.dashboardContext}
                metrics={this.state.metrics}
                nameIndex={nameIndex}
                theme={undefined}
                featureBinPickerProps={this.props.featureBinPickerProps}
                areaHeights={areaHeights}
              />
            </Stack>
          </Stack.Item>
          {/* TODO: define insights for single model view
          https://github.com/microsoft/responsible-ai-widgets/issues/104
          <Insights
            disparityArray={this.state.disparityArray}
            performanceArray={this.state.performanceArray}
            selectedMetric={selectedMetric}
            selectedPerformanceKey={
              this.props.performancePickerProps.selectedPerformanceKey
            }
          /> */}
        </Stack>
      );
    }

    return (
      <Stack style={{ height: "100%", overflowY: "auto" }}>
        {this.props.modelCount > 1 && (
          <div
            className={styles.multimodelSection}
            style={{ padding: "0 90px" }}
          >
            <ActionButton
              className={styles.multimodelButton}
              iconProps={{ iconName: "ChevronLeft" }}
              onClick={this.clearModelSelection}
            >
              {localization.Fairness.Report.backToComparisons}
            </ActionButton>
          </div>
        )}
        <div className={sharedStyles.header} style={{ padding: "0 90px" }}>
          <Text variant={"large"} className={sharedStyles.headerTitle} block>
            {localization.Fairness.Report.assessmentResults}{" "}
            <b>
              {
                this.props.dashboardContext.modelNames[
                  this.props.selectedModelIndex
                ]
              }
            </b>
          </Text>
        </div>
        <DropdownBar
          dashboardContext={this.props.dashboardContext}
          performancePickerProps={this.props.performancePickerProps}
          parityPickerProps={this.props.parityPickerProps}
          featureBinPickerProps={this.props.featureBinPickerProps}
          parentFeatureChanged={this.featureChanged}
          parentParityChanged={this.parityChanged}
          parentPerformanceChanged={this.performanceChanged}
        />
        {mainChart}
      </Stack>
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
      const index = this.props.dashboardContext.modelMetadata.featureNames.indexOf(
        featureKey
      );
      this.props.featureBinPickerProps.selectedBinIndex = index;
      this.props.featureBinPickerProps.onBinChange(index);
      this.setState({ featureKey, metrics: undefined });
    }
  };

  private readonly performanceChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (!option) {
      return;
    }
    const performanceKey = option.key.toString();
    if (this.state.performanceKey !== performanceKey) {
      this.props.performancePickerProps.onPerformanceChange(performanceKey);
      this.setState({ metrics: undefined, performanceKey });
    }
  };

  private readonly parityChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (!option) {
      return;
    }
    const parityKey = option.key.toString();
    if (this.state.parityKey !== parityKey) {
      this.props.parityPickerProps.onParityChange(parityKey);
      this.setState({ metrics: undefined, parityKey });
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
      const disparities: Dictionary<number> = {};
      const performance = await this.getMetric(
        this.props.performancePickerProps.selectedPerformanceKey
      );
      // TODO: extend disparities to query for all possible kinds of disparities
      // https://github.com/microsoft/responsible-ai-widgets/issues/65
      disparities[
        this.props.parityPickerProps.selectedParityKey
      ] = await this.getDisparityMetric(
        this.props.parityPickerProps.selectedParityKey,
        parityOptions[this.props.parityPickerProps.selectedParityKey].parityMode
      );
      switch (this.props.dashboardContext.modelMetadata.PredictionType) {
        case PredictionTypes.BinaryClassification: {
          falseNegativeRates = await this.getMetric("false_negative_rate");
          falsePositiveRates = await this.getMetric("false_positive_rate");
          outcomes = await this.getMetric("selection_rate");
          break;
        }
        case PredictionTypes.Probability: {
          predictions = this.props.dashboardContext.predictions[
            this.props.selectedModelIndex
          ];
          overpredictions = await this.getMetric("overprediction");
          underpredictions = await this.getMetric("underprediction");
          outcomes = await this.getMetric("average");
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
          break;
        }
      }
      this.setState({
        metrics: {
          disparities,
          errors,
          falseNegativeRates,
          falsePositiveRates,
          outcomes,
          overpredictions,
          performance,
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
