// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@uifabric/styling";
import {
  IDropdownStyles,
  IDropdownOption,
  Dropdown,
  Modal,
  IIconProps,
  Icon
} from "office-ui-fabric-react";
import {
  ActionButton,
  IconButton,
  PrimaryButton
} from "office-ui-fabric-react/lib/Button";
import { Spinner, SpinnerSize } from "office-ui-fabric-react/lib/Spinner";
import { Text } from "office-ui-fabric-react/lib/Text";
import React from "react";

import { IMetricResponse, PredictionTypes } from "../IFairnessProps";
import { chartColors } from "../util/chartColors";
import { FormatMetrics } from "../util/FormatMetrics";
import { ParityModes } from "../util/ParityMetrics";
import { performanceOptions } from "../util/PerformanceMetrics";

import { localization } from "@responsible-ai/localization";
import { BarPlotlyProps } from "./BarPlotlyProps";
import { IModelComparisonProps } from "./Controls/ModelComparisonChart";
import { OverallTable } from "./Controls/OverallTable";
import { PerformancePlot } from "./Controls/PerformancePlot";
import { SummaryTable } from "./Controls/SummaryTable";
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

    const iconButtonStyles = {
      root: {
        color: theme.semanticColors.bodyText,
        marginLeft: "auto",
        marginRight: "2px",
        marginTop: "4px"
      },
      rootHovered: {
        color: theme.semanticColors.bodyBackgroundHovered
      }
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

    const opportunityPlot = new BarPlotlyProps();
    const nameIndex = this.props.dashboardContext.groupNames.map((_, i) => i);
    // let howToReadPerformanceSection: React.ReactNode;
    // let howToReadOutcomesSection: React.ReactNode;
    let performanceChartHeader = "";
    // let opportunityChartHeader = "";

    const performanceKey = this.props.performancePickerProps
      .selectedPerformanceKey;
    const outcomeKey: string =
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
        ? "selection_rate"
        : "average";

    const outcomeMetric = performanceOptions[outcomeKey];

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
        // TODO: this plot doesn't actually exist, does it?
        opportunityPlot.data = [
          {
            color: chartColors[0],
            hoverinfo: "skip",
            name: outcomeMetric.title,
            orientation: "h",
            text: this.state.metrics.outcomes.bins.map((num) =>
              FormatMetrics.formatNumbers(num, "selection_rate", false, 2)
            ),
            textposition: "auto",
            type: "bar",
            x: this.state.metrics.outcomes.bins,
            y: nameIndex
          } as any
        ];
        if (opportunityPlot.layout?.xaxis) {
          opportunityPlot.layout.xaxis.tickformat = ",.0%";
        }
        // howToReadPerformanceSection = (
        //   <div className={styles.rightText}>
        //     <div className={styles.textRow}>
        //       <div
        //         className={styles.colorBlock}
        //         style={{ backgroundColor: ChartColors[1] }}
        //       />
        //       <div>
        //         <Text block>{localization.Report.underestimationError}</Text>
        //         <Text block>
        //           {localization.Report.underpredictionExplanation}
        //         </Text>
        //       </div>
        //     </div>
        //     <div className={styles.textRow}>
        //       <div
        //         className={styles.colorBlock}
        //         style={{ backgroundColor: ChartColors[0] }}
        //       />
        //       <div>
        //         <Text block>{localization.Report.overestimationError}</Text>
        //         <Text block>
        //           {localization.Report.overpredictionExplanation}
        //         </Text>
        //       </div>
        //     </div>
        //     <Text block>
        //       {localization.Report.classificationPerformanceHowToRead1}
        //     </Text>
        //     <Text block>
        //       {localization.Report.classificationPerformanceHowToRead2}
        //     </Text>
        //     <Text block>
        //       {localization.Report.classificationPerformanceHowToRead3}
        //     </Text>
        //   </div>
        // );
        // howToReadOutcomesSection = (
        //   <Text className={styles.textRow} block>
        //     {localization.Report.classificationOutcomesHowToRead}
        //   </Text>
        // );
      }
      if (
        this.props.dashboardContext.modelMetadata.PredictionType ===
        PredictionTypes.Probability
      ) {
        // TODO: this plot doesn't exist anymore, does it?
        const opportunityText = this.state.metrics.predictions?.map((val) => {
          return localization.formatString(
            localization.Report.tooltipPrediction,
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
        performanceChartHeader = localization.Report.distributionOfErrors;
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
        this.state.metrics.outcomes.global,
        outcomeKey
      );
      // const disparityOutcomeString = FormatMetrics.formatNumbers(
      //   this.state.metrics.outcomeDisparity,
      //   outcomeKey
      // );

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
        formattedBinOutcomeValues
      ];
      additionalMetrics.forEach((metricObject, metricName) => {
        formattedBinValues.push(
          metricObject?.bins.map((value) => {
            return FormatMetrics.formatNumbers(value, metricName);
          })
        );
      });

      const overallMetrics = [globalPerformanceString, globalOutcomeString];
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
        performanceOptions[outcomeKey].title
      ];
      additionalMetrics.forEach((_, metricName) => {
        metricLabels.push(performanceOptions[metricName].title);
      });

      const cancelIcon: IIconProps = { iconName: "Cancel" };

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
            <div className={styles.howTo}>
              <ActionButton onClick={this.handleOpenModalHelp}>
                <div className={styles.infoButton}>i</div>
                {localization.ModelComparison.howToRead}
              </ActionButton>
              <Modal
                titleAriaId="intro modal"
                isOpen={this.state.showModalHelp}
                onDismiss={this.handleCloseModalHelp}
                isModeless={true}
                containerClassName={styles.modalContentHelp}
              >
                <div style={{ display: "flex" }}>
                  <IconButton
                    styles={iconButtonStyles}
                    iconProps={cancelIcon}
                    ariaLabel="Close popup modal"
                    onClick={this.handleCloseModalHelp}
                  />
                </div>
                <p className={styles.modalContentHelpText}>
                  {localization.Report.classificationPerformanceHowToRead1}
                  <br />
                  <br />
                  {localization.Report.classificationPerformanceHowToRead2}
                  <br />
                  <br />
                  {localization.Report.classificationPerformanceHowToRead3}
                  <br />
                  <br />
                </p>
                <div style={{ display: "flex", paddingBottom: "20px" }}>
                  <PrimaryButton
                    className={styles.doneButton}
                    onClick={this.handleCloseModalHelp}
                  >
                    {localization.done}
                  </PrimaryButton>
                </div>
              </Modal>
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
                binValues={this.state.metrics.performance.bins}
              />
              <div className={styles.chartWrapper}>
                <div className={styles.chartHeader}>
                  {performanceChartHeader}
                </div>
                <div className={styles.chartBody}>
                  <PerformancePlot
                    dashboardContext={this.props.dashboardContext}
                    metrics={this.state.metrics}
                    nameIndex={nameIndex}
                    theme={undefined}
                  />
                </div>
              </div>
            </div>
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
          </div>
          <div className={styles.mainRight}>
            <div className={styles.insights}>
              <Icon
                iconName="CRMCustomerInsightsApp"
                className={styles.insightsIcon}
              />
              <Text style={{ verticalAlign: "middle" }}>
                {localization.ModelComparison.insights}
              </Text>
            </div>
            <div className={styles.insightsText}>{localization.loremIpsum}</div>
            <div className={styles.downloadReport}>
              <Icon iconName="Download" className={styles.downloadIcon} />
              <Text style={{ verticalAlign: "middle" }}>
                {localization.ModelComparison.downloadReport}
              </Text>
            </div>
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

  private readonly handleOpenModalHelp = (): void => {
    this.setState({ showModalHelp: true });
  };

  private readonly handleCloseModalHelp = (): void => {
    this.setState({ showModalHelp: false });
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
