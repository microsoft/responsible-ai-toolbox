// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AccessibleChart, IPlotlyProperty } from "@responsible-ai/mlchartlib";
import { getTheme } from "@uifabric/styling";
import _ from "lodash";
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

import { localization } from "./../Localization/localization";
import { IModelComparisonProps } from "./Controls/ModelComparisonChart";
import { OverallTable } from "./Controls/OverallTable";
import { SummaryTable } from "./Controls/SummaryTable";
import { WizardReportStyles } from "./WizardReport.styles";

const theme = getTheme();
interface IMetrics {
  globalPerformance: number;
  binnedPerformance: number[];
  performanceDisparity: number;
  globalOutcome: number;
  outcomeDisparity: number;
  binnedOutcome: number[];
  // Optional, based on model type
  globalOverprediction?: number;
  globalUnderprediction?: number;
  binnedOverprediction?: number[];
  binnedUnderprediction?: number[];
  // different length, raw unbinned errors and predictions
  errors?: number[];
  predictions?: number[];
}

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
      } as any
    ],
    layout: {
      autosize: true,
      barmode: "relative",
      colorway: chartColors,
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

    const performanceKey = this.props.performancePickerProps
      .selectedPerformanceKey;
    const outcomeKey =
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
        ? "selection_rate"
        : "average";
    const outcomeMetric = performanceOptions[outcomeKey];

    const overpredictionKey = "overprediction";
    const underpredictionKey = "underprediction";

    const performancePlot = _.cloneDeep(WizardReport.barPlotlyProps);
    const opportunityPlot = _.cloneDeep(WizardReport.barPlotlyProps);
    const nameIndex = this.props.dashboardContext.groupNames.map((_, i) => i);
    // let howToReadPerformanceSection: React.ReactNode;
    // let howToReadOutcomesSection: React.ReactNode;
    let performanceChartHeader = "";
    // let opportunityChartHeader = "";

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
        performancePlot.data = [
          {
            color: chartColors[0],
            hoverinfo: "skip",
            name: localization.Metrics.overprediction,
            orientation: "h",
            text: this.state.metrics.binnedOverprediction?.map((num) =>
              FormatMetrics.formatNumbers(num, "accuracy_score", false, 2)
            ),
            textposition: "auto",
            type: "bar",
            width: 0.5,
            x: this.state.metrics.binnedOverprediction,
            y: nameIndex
          } as any,
          {
            color: chartColors[1],
            hoverinfo: "skip",
            name: localization.Metrics.underprediction,
            orientation: "h",
            text: this.state.metrics.binnedUnderprediction?.map((num) =>
              FormatMetrics.formatNumbers(num, "accuracy_score", false, 2)
            ),
            textposition: "auto",
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
              text: localization.Report.underestimationError,
              x: 0.02,
              xref: "paper",
              y: 1,
              yref: "paper"
            },
            {
              font: { color: theme.semanticColors.bodySubtext, size: 10 },
              showarrow: false,
              text: localization.Report.overestimationError,
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
            color: chartColors[0],
            hoverinfo: "skip",
            name: outcomeMetric.title,
            orientation: "h",
            text: this.state.metrics.binnedOutcome.map((num) =>
              FormatMetrics.formatNumbers(num, "selection_rate", false, 2)
            ),
            textposition: "auto",
            type: "bar",
            x: this.state.metrics.binnedOutcome,
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
        performancePlot.data = [
          {
            color: chartColors[0],
            hoverinfo: "skip",
            name: localization.Metrics.overprediction,
            orientation: "h",
            text: this.state.metrics.binnedOverprediction?.map((num) =>
              FormatMetrics.formatNumbers(num, "overprediction", false, 2)
            ),
            textposition: "auto",
            type: "bar",
            width: 0.5,
            x: this.state.metrics.binnedOverprediction,
            y: nameIndex
          } as any,
          {
            color: chartColors[1],
            hoverinfo: "skip",
            name: localization.Metrics.underprediction,
            orientation: "h",
            text: this.state.metrics.binnedUnderprediction?.map((num) =>
              FormatMetrics.formatNumbers(num, "underprediction", false, 2)
            ),
            textposition: "auto",
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
              text: localization.Report.underestimationError,
              x: 0.1,
              xref: "paper",
              y: 1,
              yref: "paper"
            },
            {
              font: { color: theme.semanticColors.bodySubtext, size: 10 },
              showarrow: false,
              text: localization.Report.overestimationError,
              x: 0.9,
              xref: "paper",
              y: 1,
              yref: "paper"
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
        const performanceText = this.state.metrics.predictions?.map(
          (val, index) => {
            return `${localization.formatString(
              localization.Report.tooltipError,
              FormatMetrics.formatNumbers(
                this.state.metrics?.errors?.[index],
                "average",
                false,
                3
              )
            )}<br>${localization.formatString(
              localization.Report.tooltipPrediction,
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
        performanceChartHeader = localization.Report.distributionOfErrors;
      }

      const globalPerformanceString = FormatMetrics.formatNumbers(
        this.state.metrics.globalPerformance,
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
        this.state.metrics.globalOutcome,
        outcomeKey
      );
      // const disparityOutcomeString = FormatMetrics.formatNumbers(
      //   this.state.metrics.outcomeDisparity,
      //   outcomeKey
      // );

      const formattedBinPerformanceValues = this.state.metrics.binnedPerformance.map(
        (value) => FormatMetrics.formatNumbers(value, performanceKey)
      );
      const formattedBinOutcomeValues = this.state.metrics.binnedOutcome.map(
        (value) => FormatMetrics.formatNumbers(value, outcomeKey)
      );
      const formattedBinOverPredictionValues = this.state.metrics.binnedOverprediction?.map(
        (value) => FormatMetrics.formatNumbers(value, overpredictionKey)
      );
      const formattedBinUnderPredictionValues = this.state.metrics.binnedUnderprediction?.map(
        (value) => FormatMetrics.formatNumbers(value, underpredictionKey)
      );

      const globalOverpredictionString = FormatMetrics.formatNumbers(
        this.state.metrics.globalOverprediction,
        outcomeKey
      );
      const globalUnderpredictionString = FormatMetrics.formatNumbers(
        this.state.metrics.globalUnderprediction,
        outcomeKey
      );

      const overallMetrics = [
        globalPerformanceString,
        globalOutcomeString,
        globalOverpredictionString,
        globalUnderpredictionString
      ];
      const formattedBinValues = [
        formattedBinPerformanceValues,
        formattedBinOutcomeValues,
        formattedBinOverPredictionValues,
        formattedBinUnderPredictionValues
      ];
      const metricLabels = [
        (
          this.props.performancePickerProps.performanceOptions.find(
            (a) => a.key === performanceKey
          ) || performanceOptions[performanceKey]
        ).title,
        performanceOptions[outcomeKey].title,
        performanceOptions[overpredictionKey].title,
        performanceOptions[underpredictionKey].title
      ];

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
                binValues={this.state.metrics.binnedPerformance}
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
                binValues={this.state.metrics.binnedPerformance}
              />
              <div className={styles.chartWrapper}>
                <div className={styles.chartHeader}>
                  {performanceChartHeader}
                </div>
                <div className={styles.chartBody}>
                  <AccessibleChart
                    plotlyProps={performancePlot}
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
      // let binnedFNR: number[];
      // let binnedFPR: number[];
      let overallFalsePositiveRate: number | undefined;
      let overallFalseNegativeRate: number | undefined;
      let binnedFalsePositiveRate: number[] | undefined;
      let binnedFalseNegativeRate: number[] | undefined;
      let globalOverprediction: number | undefined;
      let globalUnderprediction: number | undefined;
      let binnedOverprediction: number[] | undefined;
      let binnedUnderprediction: number[] | undefined;
      let predictions: number[] | undefined;
      let errors: number[] | undefined;
      let outcomes: IMetricResponse;
      let outcomeDisparity: number;
      const performance = await this.props.metricsCache.getMetric(
        this.props.dashboardContext.binVector,
        this.props.featureBinPickerProps.selectedBinIndex,
        this.props.selectedModelIndex,
        this.props.performancePickerProps.selectedPerformanceKey
      );
      const performanceDisparity = await this.props.metricsCache.getDisparityMetric(
        this.props.dashboardContext.binVector,
        this.props.featureBinPickerProps.selectedBinIndex,
        this.props.selectedModelIndex,
        this.props.performancePickerProps.selectedPerformanceKey,
        ParityModes.Difference
      );
      switch (this.props.dashboardContext.modelMetadata.PredictionType) {
        case PredictionTypes.BinaryClassification: {
          let falseNegativeRateResponse: IMetricResponse = await this.getMetric(
            "false_negative_rate"
          );
          let falsePositiveRateResponse: IMetricResponse = await this.getMetric(
            "false_positive_rate"
          );
          binnedFalseNegativeRate = falseNegativeRateResponse.bins;
          overallFalseNegativeRate = falseNegativeRateResponse.global;
          binnedFalsePositiveRate = falsePositiveRateResponse.bins;
          overallFalsePositiveRate = falsePositiveRateResponse.global;
          outcomes = await this.getMetric("selection_rate");
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
          let overpredictionResponse: IMetricResponse = await this.getMetric(
            "overprediction"
          );
          let underpredictionResponse: IMetricResponse = await this.getMetric(
            "underprediction"
          );
          binnedOverprediction = overpredictionResponse.bins;
          binnedUnderprediction = underpredictionResponse.bins;
          outcomes = await this.getMetric("average");
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
          outcomes = await this.getMetric(
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
          binnedFalseNegativeRate,
          binnedFalsePositiveRate,
          binnedOutcome: outcomes.bins,
          binnedOverprediction,
          binnedPerformance: performance.bins,
          binnedUnderprediction,
          errors,
          
          globalOutcome: outcomes.global,
          globalOverprediction,
          globalPerformance: performance.global,
          globalUnderprediction,
          outcomeDisparity,
          performanceDisparity,
          predictions
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
}
