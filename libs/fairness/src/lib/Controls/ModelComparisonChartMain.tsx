// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, Spinner, SpinnerSize, Stack } from "@fluentui/react";
import { IBounds } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { AccessibleChart } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import React from "react";

import {
  IPerformancePickerPropsV2,
  IFairnessPickerPropsV2,
  IErrorPickerProps,
  IFeatureBinPickerPropsV2
} from "../FairnessWizard";
import { SharedStyles } from "../Shared.styles";
import { fairnessOptions, FairnessModes } from "../util/FairnessMetrics";
import { IFairnessContext } from "../util/IFairnessContext";
import { MetricsCache } from "../util/MetricsCache";
import { performanceOptions } from "../util/PerformanceMetrics";

import { CalloutHelpBar } from "./CalloutHelpBar";
import { Insights } from "./Insights";
import { ModelComparisonChartStyles } from "./ModelComparisonChart.styles";
import { ModelComparisonChartLoadData } from "./ModelComparisonChartLoadData";
import { getPlotlyProps } from "./ModelComparisonChartPlotlyProps";
export interface IModelComparisonChartMainProps {
  dashboardContext: IFairnessContext;
  metricsCache: MetricsCache;
  modelCount: number;
  performancePickerProps: IPerformancePickerPropsV2;
  fairnessPickerProps: IFairnessPickerPropsV2;
  errorPickerProps: IErrorPickerProps;
  featureBinPickerProps: IFeatureBinPickerPropsV2;

  onChartClick?: (data?: any) => void;
}

interface IModelComparisonChartMainState {
  performanceArray?: number[];
  performanceBounds?: Array<IBounds | undefined>;
  fairnessArray?: number[];
  fairnessBounds?: Array<IBounds | undefined>;
}

export class ModelComparisonChartMain extends React.Component<
  IModelComparisonChartMainProps,
  IModelComparisonChartMainState
> {
  public constructor(props: IModelComparisonChartMainProps) {
    super(props);
    this.state = {};
  }
  public componentDidUpdate(
    prevProps: Readonly<IModelComparisonChartMainProps>
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
    const styles = ModelComparisonChartStyles();
    const theme = getTheme();
    const sharedStyles = SharedStyles();

    if (!this.state.performanceArray || !this.state.fairnessArray) {
      return (
        <Spinner
          className={styles.spinner}
          size={SpinnerSize.large}
          label={localization.Fairness.calculating}
        />
      );
    }

    const { fairnessArray, fairnessBounds, performanceBounds } = this.state;
    const errorBarsEnabled = this.props.errorPickerProps.errorBarsEnabled;
    const data = this.state.performanceArray.map((performance, index) => {
      return {
        Fairness: fairnessArray[index],
        FairnessLowerBound: 0,
        FairnessUpperBound: 0,
        index,
        Performance: performance,
        PerformanceLowerBound: 0,
        PerformanceUpperBound: 0
      };
    });

    if (errorBarsEnabled) {
      if (_.isArray(performanceBounds)) {
        performanceBounds.forEach((bounds, index) => {
          if (bounds !== undefined) {
            data[index].PerformanceLowerBound =
              data[index].Performance - bounds.lower;
            data[index].PerformanceUpperBound =
              bounds.upper - data[index].Performance;
          }
        });
      }

      if (_.isArray(fairnessBounds)) {
        fairnessBounds.forEach((bounds, index) => {
          if (bounds !== undefined) {
            data[index].FairnessLowerBound =
              data[index].Fairness - bounds.lower;
            data[index].FairnessUpperBound =
              bounds.upper - data[index].Fairness;
          }
        });
      }
    }

    const selectedMetric =
      performanceOptions[
        this.props.performancePickerProps.selectedPerformanceKey
      ] ||
      this.props.performancePickerProps.performanceOptions.find(
        (metric) =>
          metric.key ===
          this.props.performancePickerProps.selectedPerformanceKey
      );
    const selectedFairnessMetric =
      fairnessOptions[this.props.fairnessPickerProps.selectedFairnessKey] ||
      this.props.fairnessPickerProps.fairnessOptions.find(
        (metric) =>
          metric.key === this.props.fairnessPickerProps.selectedFairnessKey
      );

    const performanceMetricTitle = selectedMetric.title;
    const fairnessMetric =
      fairnessOptions[this.props.fairnessPickerProps.selectedFairnessKey];
    const fairnessMetricTitle = fairnessMetric.title;

    // The help text for performance metrics needs to indicate
    // that a lower/higher value is better in the corresponding cases.
    const helpModalText1 = localization.formatString(
      localization.Fairness.ModelComparison.helpModalText1,
      selectedMetric.isMinimization
        ? localization.Fairness.ModelComparison.lower
        : localization.Fairness.ModelComparison.higher
    );

    /* The following modal text needs to indicate whether lower or higher
    is preferable given the selected fairness metric. For difference and
    maximum based metrics lower is preferable, for ratio and minimum based
    metrics higher is better. */
    const helpModalText2 = localization.formatString(
      localization.Fairness.ModelComparison.helpModalText2,
      new Set([FairnessModes.Difference, FairnessModes.Max]).has(
        fairnessMetric.fairnessMode
      )
        ? localization.Fairness.ModelComparison.lower
        : localization.Fairness.ModelComparison.higher
    );

    const helpString = [
      localization.Fairness.ModelComparison.introModalText,
      helpModalText1,
      helpModalText2
    ];

    return (
      <Stack horizontal>
        <Stack className={sharedStyles.mainLeft}>
          <CalloutHelpBar
            graphCalloutStrings={helpString}
            errorPickerProps={this.props.errorPickerProps}
            performanceBounds={this.state.performanceBounds}
            fairnessBounds={this.state.fairnessBounds}
            parentErrorChanged={this.errorChanged}
          />
          <div id="FairnessPerformanceTradeoffChart">
            <AccessibleChart
              plotlyProps={getPlotlyProps(
                this.props.dashboardContext,
                data,
                performanceMetricTitle,
                fairnessMetricTitle
              )}
              onClickHandler={this.props.onChartClick}
              theme={theme}
              themeOverride={{
                axisGridColor: theme.semanticColors.disabledBorder
              }}
            />
          </div>
        </Stack>
        <Insights
          fairnessArray={this.state.fairnessArray}
          performanceArray={this.state.performanceArray}
          selectedMetric={selectedMetric}
          selectedFairnessMetric={selectedFairnessMetric}
          selectedPerformanceKey={
            this.props.performancePickerProps.selectedPerformanceKey
          }
        />
      </Stack>
    );
  }

  private loadData = async (): Promise<void> => {
    this.setState({
      fairnessArray: undefined,
      fairnessBounds: undefined,
      performanceArray: undefined,
      performanceBounds: undefined
    });
    const data = await ModelComparisonChartLoadData(
      this.props.dashboardContext,
      this.props.metricsCache,
      this.props.performancePickerProps,
      this.props.fairnessPickerProps,
      this.props.errorPickerProps,
      this.props.featureBinPickerProps,
      this.props.modelCount
    );
    if (!data) {
      return;
    }
    this.setState({
      fairnessArray: data.fairnessArray,
      fairnessBounds: data.fairnessBounds,
      performanceArray: data.performanceArray,
      performanceBounds: data.performanceBounds
    });
  };
  private readonly errorChanged = (
    _ev: React.MouseEvent<HTMLElement>,
    checked?: boolean
  ): void => {
    const errorBarsEnabled = checked;
    this.props.errorPickerProps.onErrorChange(errorBarsEnabled ?? false);
  };
}
