// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { Dropdown, IDropdownOption, Stack } from "office-ui-fabric-react";
import React from "react";

import { PredictionTypes } from "../../IFairnessProps";
import { IFairnessContext } from "../../util/IFairnessContext";
import {
  IPerformancePickerPropsV2,
  IFairnessPickerPropsV2,
  IFeatureBinPickerPropsV2
} from "../FairnessWizard";
import { IMetrics } from "../IMetrics";

import { OutcomePlot } from "./OutcomePlot";
import { PerformancePlot } from "./PerformancePlot";

export interface IReportChartProps {
  dashboardContext: IFairnessContext;
  performancePickerProps: IPerformancePickerPropsV2;
  fairnessPickerProps: IFairnessPickerPropsV2;
  featureBinPickerProps: IFeatureBinPickerPropsV2;
  areaHeights: number;
  metrics: IMetrics;
  chartKey?: string;
  onUpdateChartKey: (chartKey: string) => void;
}

const performanceKey = "performance";
const outcomeKey = "outcome";

export interface IState {
  chartKey: string;
}

export class ReportChart extends React.Component<IReportChartProps, IState> {
  public constructor(props: IReportChartProps) {
    super(props);
    if (this.props.chartKey) {
      this.state = { chartKey: this.props.chartKey };
    } else {
      this.state = { chartKey: outcomeKey };
    }
    this.props.onUpdateChartKey(this.state.chartKey);
  }

  public render(): React.ReactNode {
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
        PredictionTypes.Regression &&
        this.props.metrics.errors)
    ) {
      displayOptions.push({
        key: performanceKey,
        text: performanceChartHeaderString
      });
    }

    return (
      <Stack tokens={{ childrenGap: "l1" }}>
        <Dropdown
          id="chartSelectionDropdown"
          styles={{ dropdown: { maxWidth: "75%" } }}
          label={localization.Fairness.Report.chartChoiceDropdownHeader}
          defaultSelectedKey={this.state.chartKey}
          options={displayOptions}
          disabled={false}
          onChange={this.onChange.bind(this)}
        />
        {this.state.chartKey === performanceKey && (
          <PerformancePlot
            dashboardContext={this.props.dashboardContext}
            metrics={this.props.metrics}
            featureBinPickerProps={this.props.featureBinPickerProps}
            performancePickerProps={this.props.performancePickerProps}
            areaHeights={this.props.areaHeights}
          />
        )}
        {this.state.chartKey === outcomeKey && (
          <OutcomePlot
            dashboardContext={this.props.dashboardContext}
            metrics={this.props.metrics}
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
    if (option.key !== this.state.chartKey) {
      let newChartKey = option.key.toString();
      this.props.onUpdateChartKey(newChartKey);
      this.setState({ chartKey: newChartKey });
    }
  }
}
