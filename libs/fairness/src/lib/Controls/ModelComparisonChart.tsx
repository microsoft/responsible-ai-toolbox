// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Text, Stack, IDropdownOption } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import {
  IPerformancePickerPropsV2,
  IFeatureBinPickerPropsV2,
  IFairnessPickerPropsV2,
  IErrorPickerProps
} from "../FairnessWizard";
import { SharedStyles } from "../Shared.styles";

import { IFairnessContext } from "./../util/IFairnessContext";
import { MetricsCache } from "./../util/MetricsCache";
import { DropdownBar } from "./DropdownBar";
import { ModelComparisonChartStyles } from "./ModelComparisonChart.styles";
import { ModelComparisonChartMain } from "./ModelComparisonChartMain";

export interface IModelComparisonProps {
  showIntro: boolean;
  dashboardContext: IFairnessContext;
  metricsCache: MetricsCache;
  modelCount: number;
  performancePickerProps: IPerformancePickerPropsV2;
  fairnessPickerProps: IFairnessPickerPropsV2;
  errorPickerProps: IErrorPickerProps;
  featureBinPickerProps: IFeatureBinPickerPropsV2;
  onHideIntro: () => void;
  onChartClick?: (data?: any) => void;
}

export class ModelComparisonChart extends React.Component<IModelComparisonProps> {
  public render(): React.ReactNode {
    const styles = ModelComparisonChartStyles();
    const sharedStyles = SharedStyles();

    return (
      <Stack className={styles.frame}>
        <div className={sharedStyles.header} style={{ padding: "0 90px" }}>
          <Text variant={"large"} className={sharedStyles.headerTitle} block>
            {localization.Fairness.ModelComparison.title} <b>assessment</b>
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
        <ModelComparisonChartMain
          dashboardContext={this.props.dashboardContext}
          errorPickerProps={this.props.errorPickerProps}
          fairnessPickerProps={this.props.fairnessPickerProps}
          featureBinPickerProps={this.props.featureBinPickerProps}
          metricsCache={this.props.metricsCache}
          modelCount={this.props.modelCount}
          performancePickerProps={this.props.performancePickerProps}
          onChartClick={this.props.onChartClick}
        />
      </Stack>
    );
  }

  private readonly featureChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
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
    this.props.featureBinPickerProps.onBinChange(index);
  };

  private readonly performanceChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (typeof option?.key !== "string") {
      return;
    }
    const performanceKey = option.key;
    this.props.performancePickerProps.onPerformanceChange(performanceKey);
  };

  private readonly fairnessChanged = (
    _ev: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    if (typeof option?.key !== "string") {
      return;
    }
    const fairnessKey = option.key;
    this.props.fairnessPickerProps.onFairnessChange(fairnessKey);
  };
}
