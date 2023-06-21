// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Stack,
  Text
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { OverallTable } from "./Controls/OverallTable";
import { ReportChart } from "./Controls/ReportChart";
import {
  IPerformancePickerPropsV2,
  IFairnessPickerPropsV2,
  IErrorPickerProps,
  IFeatureBinPickerPropsV2
} from "./FairnessWizard";
import { IMetrics } from "./IMetrics";
import { SharedStyles } from "./Shared.styles";
import { IFairnessContext } from "./util/IFairnessContext";
import { MetricsCache } from "./util/MetricsCache";
import { WizardReportStyles } from "./WizardReport.styles";
import { loadMetrics } from "./WizardReportHelper";

export interface IWizardReportMainChartProps {
  dashboardContext: IFairnessContext;
  metricsCache: MetricsCache;
  performancePickerProps: IPerformancePickerPropsV2;
  fairnessPickerProps: IFairnessPickerPropsV2;
  errorPickerProps: IErrorPickerProps;
  featureBinPickerProps: IFeatureBinPickerPropsV2;
  selectedModelIndex: number;
}
interface IWizardReportMainChartState {
  chartKey?: string;
  metrics?: IMetrics;
}

export class WizardReportMainChart extends React.Component<
  IWizardReportMainChartProps,
  IWizardReportMainChartState
> {
  public constructor(props: IWizardReportMainChartProps) {
    super(props);
    this.state = {};
  }
  public componentDidUpdate(
    prevProps: Readonly<IWizardReportMainChartProps>
  ): void {
    if (
      this.props.errorPickerProps.errorBarsEnabled !==
        prevProps.errorPickerProps.errorBarsEnabled ||
      this.props.featureBinPickerProps.selectedBinIndex !==
        prevProps.featureBinPickerProps.selectedBinIndex ||
      this.props.performancePickerProps.selectedPerformanceKey !==
        prevProps.performancePickerProps.selectedPerformanceKey ||
      this.props.fairnessPickerProps.selectedFairnessKey !==
        prevProps.fairnessPickerProps.selectedFairnessKey
    ) {
      this.loadData();
    }
  }
  public componentDidMount(): void {
    this.loadData();
  }
  public render(): React.ReactNode {
    const styles = WizardReportStyles();
    const sharedStyles = SharedStyles();
    if (!this.state.metrics) {
      return (
        <Spinner
          className={styles.spinner}
          size={SpinnerSize.large}
          label={localization.Fairness.calculating}
        />
      );
    }
    if (
      !this.state.metrics.performance ||
      !this.state.metrics.outcomes ||
      !this.state.metrics.disparities
    ) {
      return (
        <MessageBar messageBarType={MessageBarType.warning}>
          <Text>
            {localization.Fairness.ValidationErrors.missingPerformanceMetric}
          </Text>
        </MessageBar>
      );
    }
    const alternateHeight =
      this.props.featureBinPickerProps.featureBins[
        this.props.featureBinPickerProps.selectedBinIndex
      ].labelArray.length *
        60 +
      106;
    const areaHeights = Math.max(300, alternateHeight);
    return (
      <Stack horizontal>
        <Stack.Item className={sharedStyles.mainLeft}>
          <Stack tokens={{ childrenGap: "l1", padding: "0 0 0 100px" }}>
            <OverallTable
              dashboardContext={this.props.dashboardContext}
              fairnessPickerProps={this.props.fairnessPickerProps}
              performancePickerProps={this.props.performancePickerProps}
              metrics={this.state.metrics}
            />
            <ReportChart
              areaHeights={areaHeights}
              dashboardContext={this.props.dashboardContext}
              featureBinPickerProps={this.props.featureBinPickerProps}
              metrics={this.state.metrics}
              fairnessPickerProps={this.props.fairnessPickerProps}
              performancePickerProps={this.props.performancePickerProps}
              errorPickerProps={this.props.errorPickerProps}
              chartKey={this.state.chartKey}
              onUpdateChartKey={this.updateChartKey}
              parentErrorChanged={this.errorChanged}
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

  private readonly errorChanged = (
    _ev: React.MouseEvent<HTMLElement>,
    checked?: boolean
  ): void => {
    const errorBarsEnabled = checked;
    if (this.props.errorPickerProps.errorBarsEnabled !== errorBarsEnabled) {
      this.props.errorPickerProps.onErrorChange(errorBarsEnabled ?? false);
    }
  };

  private async loadData(): Promise<void> {
    this.setState({
      metrics: undefined
    });
    const metrics = await loadMetrics(
      this.props.dashboardContext,
      this.props.metricsCache,
      this.props.performancePickerProps,
      this.props.fairnessPickerProps,
      this.props.errorPickerProps,
      this.props.featureBinPickerProps,
      this.props.selectedModelIndex
    );
    if (!metrics) {
      return;
    }
    this.setState({
      metrics
    });
  }

  private readonly updateChartKey = (chartKey: string): void => {
    this.setState({ chartKey });
  };
}
