// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption, Stack, ActionButton, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { DropdownBar } from "./Controls/DropdownBar";
import { IModelComparisonProps } from "./Controls/ModelComparisonChart";
import { SharedStyles } from "./Shared.styles";
import { WizardReportStyles } from "./WizardReport.styles";
import { WizardReportMainChart } from "./WizardReportMainChart";

export interface IState {
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
          featureBinPickerProps={this.props.featureBinPickerProps}
          parentFeatureChanged={this.featureChanged}
          parentFairnessChanged={this.fairnessChanged}
          parentPerformanceChanged={this.performanceChanged}
        />
        <WizardReportMainChart
          dashboardContext={this.props.dashboardContext}
          errorPickerProps={this.props.errorPickerProps}
          fairnessPickerProps={this.props.fairnessPickerProps}
          featureBinPickerProps={this.props.featureBinPickerProps}
          performancePickerProps={this.props.performancePickerProps}
          metricsCache={this.props.metricsCache}
          selectedModelIndex={this.props.selectedModelIndex}
        />
      </Stack>
    );
  }

  private readonly clearModelSelection = (): void => {
    if (this.props.onChartClick) {
      this.props.onChartClick();
    }
  };

  private readonly featureChanged = (
    _: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (typeof option?.key !== "string") {
      return;
    }
    const featureKey = option.key;
    const index =
      this.props.dashboardContext.modelMetadata.featureNames.indexOf(
        featureKey
      );
    if (this.props.featureBinPickerProps.selectedBinIndex !== index) {
      this.props.featureBinPickerProps.onBinChange(index);
    }
  };

  private readonly performanceChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (typeof option?.key !== "string") {
      return;
    }
    const performanceKey = option.key;
    if (
      this.props.performancePickerProps.selectedPerformanceKey !==
      performanceKey
    ) {
      this.props.performancePickerProps.onPerformanceChange(performanceKey);
    }
  };

  private readonly fairnessChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (typeof option?.key !== "string") {
      return;
    }
    const fairnessKey = option.key.toString();
    if (this.props.fairnessPickerProps.selectedFairnessKey !== fairnessKey) {
      this.props.fairnessPickerProps.onFairnessChange(fairnessKey);
    }
  };
}
