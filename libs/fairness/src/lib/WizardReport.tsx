// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IMetricResponse, PredictionTypes } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Dictionary } from "lodash";
import {
  IDropdownOption,
  Stack,
  ActionButton,
  Spinner,
  SpinnerSize,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { DropdownBar } from "./Controls/DropdownBar";
import { IModelComparisonProps } from "./Controls/ModelComparisonChart";
import { OverallTable } from "./Controls/OverallTable";
import { ReportChart } from "./Controls/ReportChart";
import { IMetrics } from "./IMetrics";
import { SharedStyles } from "./Shared.styles";
import { FairnessModes, fairnessOptions } from "./util/FairnessMetrics";
import { FormatMetrics } from "./util/FormatMetrics";
import { performanceOptions } from "./util/PerformanceMetrics";
import { WizardReportStyles } from "./WizardReport.styles";

export interface IState {
  metrics?: IMetrics;
  featureKey?: string;
  fairnessKey?: string;
  performanceKey?: string;
  errorKey?: string;
  showModalHelp?: boolean;
  chartKey?: string;
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

    const performanceKey = this.props.performancePickerProps
      .selectedPerformanceKey;
    const fairnessKey = this.props.fairnessPickerProps.selectedFairnessKey;
    // const errorKey = this.props.errorPickerProps.selectedErrorKey;
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
              "fallout_rate",
              this.state.metrics.falsePositiveRates
            );
          }
          if (this.state.metrics.falseNegativeRates) {
            additionalMetrics.set(
              "miss_rate",
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

      const fairnessMetricString = FormatMetrics.formatNumbers(
        this.state.metrics.disparities[
          this.props.fairnessPickerProps.selectedFairnessKey
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
        formattedBinOutcomeValues.map(() => "") // empty entries for fairness outcome column
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
        fairnessMetricString
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
          this.props.fairnessPickerProps.fairnessOptions.find(
            (a) => a.key === fairnessKey
          ) || fairnessOptions[fairnessKey]
        ).title
      ];
      additionalMetrics.forEach((_, metricName) => {
        metricLabels.push(performanceOptions[metricName].title);
      });

      mainChart = (
        <Stack horizontal>
          <Stack.Item className={sharedStyles.mainLeft}>
            <Stack tokens={{ childrenGap: "l1", padding: "0 0 0 100px" }}>
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
                binValues={this.state.metrics.performance.bins}
              />
              <ReportChart
                areaHeights={areaHeights}
                dashboardContext={this.props.dashboardContext}
                featureBinPickerProps={this.props.featureBinPickerProps}
                metrics={this.state.metrics}
                fairnessPickerProps={this.props.fairnessPickerProps}
                performancePickerProps={this.props.performancePickerProps}
                chartKey={this.state.chartKey}
                onUpdateChartKey={this.updateChartKey}
              />
            </Stack>
          </Stack.Item>
          {/* TODO: define insights for single model view
          https://github.com/microsoft/responsible-ai-widgets/issues/104
          <Insights
            fairnessArray={this.state.fairnessArray}
            performanceArray={this.state.performanceArray}
            selectedMetric={selectedMetric}
            selectedFairnessMetric={selectedFairnessMetric}
            selectedPerformanceKey={
              this.props.performancePickerProps.selectedPerformanceKey
            }
          /> */}
        </Stack>
      );
    }

    return (
      <Stack style={{ height: "100%", overflowY: "auto", width: "100%" }}>
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
          fairnessPickerProps={this.props.fairnessPickerProps}
          errorPickerProps={this.props.errorPickerProps}
          featureBinPickerProps={this.props.featureBinPickerProps}
          parentFeatureChanged={this.featureChanged}
          parentFairnessChanged={this.fairnessChanged}
          parentPerformanceChanged={this.performanceChanged}
          parentErrorChanged={this.errorChanged}
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

  // private readonly onEditConfigs = (): void => {
  //   if (this.props.modelCount > 1) {
  //     this.props.onChartClick(undefined);
  //   }
  //   this.props.onEditConfigs();
  // };

  private readonly updateChartKey = (chartKey: string): void => {
    this.setState({ chartKey });
  };

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

  private readonly fairnessChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (!option) {
      return;
    }
    const fairnessKey = option.key.toString();
    if (this.state.fairnessKey !== fairnessKey) {
      this.props.fairnessPickerProps.onFairnessChange(fairnessKey);
      this.setState({ fairnessKey, metrics: undefined });
    }
  };

  private readonly errorChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (!option) {
      return;
    }
    const errorKey = option.key.toString();
    if (this.state.errorKey !== errorKey) {
      this.props.errorPickerProps.onErrorChange(errorKey);
      this.setState({ errorKey, metrics: undefined });
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
        this.props.performancePickerProps.selectedPerformanceKey,
        this.props.errorPickerProps.selectedErrorKey
      );
      // TODO: extend disparities to query for all possible kinds of disparities
      // https://github.com/microsoft/responsible-ai-widgets/issues/65
      disparities[
        this.props.fairnessPickerProps.selectedFairnessKey
      ] = await this.getFairnessMetric(
        this.props.fairnessPickerProps.selectedFairnessKey,
        fairnessOptions[this.props.fairnessPickerProps.selectedFairnessKey]
          .fairnessMode,
        this.props.errorPickerProps.selectedErrorKey
      );
      switch (this.props.dashboardContext.modelMetadata.PredictionType) {
        case PredictionTypes.BinaryClassification: {
          falseNegativeRates = await this.getMetric(
            "miss_rate",
            this.props.errorPickerProps.selectedErrorKey
          );
          falsePositiveRates = await this.getMetric(
            "fallout_rate",
            this.props.errorPickerProps.selectedErrorKey
          );
          outcomes = await this.getMetric(
            "selection_rate",
            this.props.errorPickerProps.selectedErrorKey
          );
          break;
        }
        case PredictionTypes.Probability: {
          predictions = this.props.dashboardContext.predictions[
            this.props.selectedModelIndex
          ];
          overpredictions = await this.getMetric(
            "overprediction",
            this.props.errorPickerProps.selectedErrorKey
          );
          underpredictions = await this.getMetric(
            "underprediction",
            this.props.errorPickerProps.selectedErrorKey
          );
          outcomes = await this.getMetric(
            "average",
            this.props.errorPickerProps.selectedErrorKey
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
          outcomes = await this.getMetric(
            "average",
            this.props.errorPickerProps.selectedErrorKey
          );
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

  private async getMetric(
    metricName: string,
    errorKey: string
  ): Promise<IMetricResponse> {
    return await this.props.metricsCache.getMetric(
      this.props.dashboardContext.binVector,
      this.props.featureBinPickerProps.selectedBinIndex,
      this.props.selectedModelIndex,
      metricName,
      errorKey
    );
  }

  private async getFairnessMetric(
    metricName: string,
    fairnessMode: FairnessModes,
    errorKey: string
  ): Promise<number> {
    return await this.props.metricsCache.getFairnessMetric(
      this.props.dashboardContext.binVector,
      this.props.featureBinPickerProps.selectedBinIndex,
      this.props.selectedModelIndex,
      metricName,
      fairnessMode,
      errorKey
    );
  }
}
