// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  Dropdown,
  IDropdownOption,
  IDropdownStyles,
  Stack
} from "office-ui-fabric-react";
import React from "react";

import { PredictionTypes } from "../../IFairnessProps";
import { IFairnessContext } from "../../util/IFairnessContext";
import {
  IPerformancePickerPropsV2,
  IFairnessPickerPropsV2,
  IFeatureBinPickerPropsV2
} from "../FairnessWizard";
import { IMetrics } from "../IMetrics";

import { DropdownBarStyles } from "./DropdownBarStyles";
import { OutcomePlot } from "./OutcomePlot";
import { PerformancePlot } from "./PerformancePlot";

export interface IReportChartProps {
  dashboardContext: IFairnessContext;
  performancePickerProps: IPerformancePickerPropsV2;
  fairnessPickerProps: IFairnessPickerPropsV2;
  featureBinPickerProps: IFeatureBinPickerPropsV2;
  areaHeights: number;
  metrics: IMetrics;
}

const performanceKey = "performance";
const outcomeKey = "outcome";

export interface IState {
  displayPlotKey: string;
}

export class ReportChart extends React.Component<IReportChartProps, IState> {
  public constructor(props: IReportChartProps) {
    super(props);
    this.state = { displayPlotKey: outcomeKey };
  }

  public render(): React.ReactNode {
    const styles = DropdownBarStyles();
    const dropdownStyles: Partial<IDropdownStyles> = {
      dropdown: { width: 180 },
      title: { borderRadius: "5px" }
    };

    let performanceChartHeaderString = "";
    let outcomeChartHeaderString = "";

    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
    ) {
      performanceChartHeaderString =
        localization.Fairness.Report.performanceChartHeaderBinaryClassification;
      outcomeChartHeaderString = localization.Fairness.Metrics.selectionRate;
    }
    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.Probability
    ) {
      performanceChartHeaderString =
        localization.Fairness.Report.performanceChartHeaderProbability;
      outcomeChartHeaderString =
        localization.Fairness.Report.distributionOfPredictions;
    }
    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.Regression
    ) {
      performanceChartHeaderString =
        localization.Fairness.Report.performanceChartHeaderRegression;
      outcomeChartHeaderString =
        localization.Fairness.Report.distributionOfPredictions;
    }

    const nameIndex = this.props.dashboardContext.groupNames.map((_, i) => i);

    const displayOptions = [
      { key: outcomeKey, text: outcomeChartHeaderString }
    ];

    // provide performance chart option only if we have the corresponding metrics
    if (
      (this.props.dashboardContext.modelMetadata.PredictionType ===
        PredictionTypes.BinaryClassification &&
        this.props.metrics.falseNegativeRates &&
        this.props.metrics.falsePositiveRates) ||
      (this.props.dashboardContext.modelMetadata.PredictionType ===
        PredictionTypes.Probability &&
        this.props.metrics.overpredictions &&
        this.props.metrics.underpredictions) ||
        (this.props.dashboardContext.modelMetadata.PredictionType ===
          PredictionTypes.Probability &&
          this.props.metrics.errors)
    ) {
      displayOptions.push({
        key: performanceKey,
        text: performanceChartHeaderString
      });
    }

    return (
      <Stack>
        <Dropdown
          label={localization.Fairness.Report.chartChoiceDropdownHeader}
          className={styles.dropDown}
          defaultSelectedKey={this.state.displayPlotKey}
          options={displayOptions}
          disabled={false}
          onChange={this.onChange.bind(this)}
          styles={dropdownStyles}
        />
        {this.state.displayPlotKey === performanceKey && (
          <PerformancePlot
            dashboardContext={this.props.dashboardContext}
            metrics={this.props.metrics}
            nameIndex={nameIndex}
            theme={undefined}
            featureBinPickerProps={this.props.featureBinPickerProps}
            performancePickerProps={this.props.performancePickerProps}
            areaHeights={this.props.areaHeights}
          />
        )}
        {this.state.displayPlotKey === outcomeKey && (
          <OutcomePlot
            dashboardContext={this.props.dashboardContext}
            metrics={this.props.metrics}
            nameIndex={nameIndex}
            theme={undefined}
            featureBinPickerProps={this.props.featureBinPickerProps}
            areaHeights={this.props.areaHeights}
          />
        )}
      </Stack>
    );
  }

  public onChange(
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption | undefined
  ): void {
    if (!option) {
      return;
    }
    if (option.key !== this.state.displayPlotKey) {
      this.setState({ displayPlotKey: option.key.toString() });
    }
  }
}
