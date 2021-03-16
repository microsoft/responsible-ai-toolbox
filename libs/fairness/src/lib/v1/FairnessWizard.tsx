// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PredictionTypes } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { RangeTypes } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import {
  Pivot,
  PivotItem,
  Stack,
  StackItem,
  Text,
  loadTheme
} from "office-ui-fabric-react";
import React from "react";

import { EmptyHeader } from "../components/EmptyHeader";
import { IFairnessProps } from "../IFairnessProps";
import { IBinnedResponse } from "../util/IBinnedResponse";
import {
  IFairnessContext,
  IRunTimeFairnessContext
} from "../util/IFairnessContext";
import { MetricsCache } from "../util/MetricsCache";
import {
  IPerformanceOption,
  performanceOptions
} from "../util/PerformanceMetrics";
import { WizardBuilder } from "../util/WizardBuilder";

import { FairnessTab } from "./Controls/FairnessTab";
import { FeatureTab } from "./Controls/FeatureTab";
import { IntroTab } from "./Controls/IntroTab";
import { ModelComparisonChart } from "./Controls/ModelComparisonChart";
import { PerformanceTab } from "./Controls/PerformanceTab";
import { FairnessWizardStyles } from "./FairnessWizard.styles";
import { defaultTheme } from "./Themes";
import { WizardReport } from "./WizardReport";

export interface IPerformancePickerPropsV1 {
  performanceOptions: IPerformanceOption[];
  selectedPerformanceKey: string;
  onPerformanceChange: (newKey: string) => void;
}

export interface IFairnessPickerPropsV1 {
  fairnessOptions: IPerformanceOption[];
  selectedFairnessKey: string;
  onFairnessChange: (newKey: string) => void;
}

export interface IFeatureBinPickerPropsV1 {
  featureBins: IBinnedResponse[];
  selectedBinIndex: number;
  onBinChange: (index: number) => void;
}

export interface IWizardStateV1 {
  activeTabKey: string;
  selectedModelId?: number;
  dashboardContext: IFairnessContext;
  performanceMetrics: IPerformanceOption[];
  fairnessMetrics: IPerformanceOption[];
  selectedPerformanceKey: string;
  selectedFairnessKey: string;
  featureBins: IBinnedResponse[];
  selectedBinIndex: number;
  metricCache: MetricsCache;
}

const introTabKey = "introTab";
const featureBinTabKey = "featureBinTab";
const performanceTabKey = "performanceTab";
const fairnessTabKey = "fairnessTab";
const reportTabKey = "reportTab";

const flights = {
  skipFairness: true
};

export class FairnessWizardV1 extends React.PureComponent<
  IFairnessProps,
  IWizardStateV1
> {
  public constructor(props: IFairnessProps) {
    super(props);
    if (this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
    let performanceMetrics: IPerformanceOption[];
    loadTheme(props.theme || defaultTheme);
    // handle the case of precomputed metrics separately. As it becomes more defined, can integrate with existing code path.
    if (this.props.precomputedMetrics && this.props.precomputedFeatureBins) {
      // we must assume that the same performance metrics are provided across models and bins
      performanceMetrics = WizardBuilder.buildPerformanceListForPrecomputedMetrics(
        this.props
      );
      const readonlyFeatureBins = this.props.precomputedFeatureBins.map(
        (initialBin, index) => {
          return {
            array: initialBin.binLabels,
            featureIndex: index,
            hasError: false,
            labelArray: initialBin.binLabels,
            rangeType: RangeTypes.Categorical
          };
        }
      );
      this.state = {
        activeTabKey: featureBinTabKey,
        dashboardContext: WizardBuilder.buildPrecomputedFairnessContext(
          this.props
        ),
        fairnessMetrics: performanceMetrics,
        featureBins: readonlyFeatureBins,
        metricCache: new MetricsCache(
          0,
          0,
          undefined,
          props.precomputedMetrics
        ),
        performanceMetrics,
        selectedBinIndex: 0,
        selectedFairnessKey: performanceMetrics[0].key,
        selectedModelId: this.props.predictedY.length === 1 ? 0 : undefined,
        selectedPerformanceKey: performanceMetrics[0].key
      };
      return;
    }
    const fairnessContext = WizardBuilder.buildInitialFairnessContext(
      this.props
    );

    const featureBins = WizardBuilder.buildFeatureBins(fairnessContext);
    if (featureBins.length > 0) {
      fairnessContext.binVector = WizardBuilder.generateBinVectorForBin(
        featureBins[0],
        fairnessContext.dataset
      );
      fairnessContext.groupNames = featureBins[0].labelArray;
    }

    performanceMetrics = this.getPerformanceMetrics(fairnessContext);
    performanceMetrics = performanceMetrics.filter((metric) => !!metric);

    this.state = {
      activeTabKey: introTabKey,
      dashboardContext: fairnessContext,
      fairnessMetrics: performanceMetrics,
      featureBins,
      metricCache: new MetricsCache(
        featureBins.length,
        this.props.predictedY.length,
        this.props.requestMetrics
      ),
      performanceMetrics,
      selectedBinIndex: 0,
      selectedFairnessKey: performanceMetrics[0].key,
      selectedModelId: this.props.predictedY.length === 1 ? 0 : undefined,
      selectedPerformanceKey: performanceMetrics[0].key
    };
  }

  public componentDidUpdate(prev: IFairnessProps): void {
    if (prev.theme !== this.props.theme) {
      loadTheme(this.props.theme || defaultTheme);
    }
    if (this.props.locale && prev.locale !== this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
  }

  public render(): React.ReactNode {
    const styles = FairnessWizardStyles();
    const performancePickerProps = {
      onPerformanceChange: this.setPerformanceKey,
      performanceOptions: this.state.performanceMetrics,
      selectedPerformanceKey: this.state.selectedPerformanceKey
    };
    const fairnessPickerProps = {
      fairnessOptions: this.state.fairnessMetrics,
      onFairnessChange: this.setFairnessKey,
      selectedFairnessKey: this.state.selectedFairnessKey
    };
    const featureBinPickerProps = {
      featureBins: this.state.featureBins,
      onBinChange: this.setBinIndex,
      selectedBinIndex: this.state.selectedBinIndex
    };
    if (this.state.featureBins.length === 0) {
      return (
        <Stack className={styles.frame}>
          <EmptyHeader />
          <Stack.Item grow={2} className={styles.body}>
            <Text variant={"mediumPlus"}>
              {localization.Fairness.errorOnInputs}
            </Text>
          </Stack.Item>
        </Stack>
      );
    }
    return (
      <Stack className={styles.frame}>
        <EmptyHeader />
        {this.state.activeTabKey === introTabKey && (
          <StackItem grow={2} className={styles.body}>
            <IntroTab onNext={this.setTab.bind(this, featureBinTabKey)} />
          </StackItem>
        )}
        {(this.state.activeTabKey === featureBinTabKey ||
          this.state.activeTabKey === performanceTabKey ||
          this.state.activeTabKey === fairnessTabKey) && (
          <Stack.Item grow={2} className={styles.body}>
            <Pivot
              className={styles.pivot}
              styles={{
                itemContainer: {
                  height: "100%"
                }
              }}
              selectedKey={this.state.activeTabKey}
              onLinkClick={this.handleTabClick}
            >
              <PivotItem
                headerText={localization.Fairness.Intro.features}
                itemKey={featureBinTabKey}
                style={{ height: "100%", paddingLeft: "8px" }}
              >
                <FeatureTab
                  dashboardContext={this.state.dashboardContext}
                  selectedFeatureChange={this.setBinIndex}
                  selectedFeatureIndex={this.state.selectedBinIndex}
                  featureBins={this.state.featureBins.filter((x) => !!x)}
                  onNext={this.setTab.bind(this, performanceTabKey)}
                  saveBin={this.saveBin}
                />
              </PivotItem>
              <PivotItem
                headerText={localization.Fairness.performanceMetricLegacy}
                itemKey={performanceTabKey}
                style={{ height: "100%", paddingLeft: "8px" }}
              >
                <PerformanceTab
                  dashboardContext={this.state.dashboardContext}
                  performancePickerProps={performancePickerProps}
                  onNext={this.setTab.bind(
                    this,
                    flights.skipFairness ? reportTabKey : fairnessTabKey
                  )}
                  onPrevious={this.setTab.bind(this, featureBinTabKey)}
                />
              </PivotItem>
              {flights.skipFairness === false && (
                <PivotItem headerText={"Fairness"} itemKey={fairnessTabKey}>
                  <FairnessTab
                    dashboardContext={this.state.dashboardContext}
                    fairnessPickerProps={fairnessPickerProps}
                    onNext={this.setTab.bind(this, reportTabKey)}
                    onPrevious={this.setTab.bind(this, performanceTabKey)}
                  />
                </PivotItem>
              )}
            </Pivot>
          </Stack.Item>
        )}
        {this.state.activeTabKey === reportTabKey &&
          this.state.selectedModelId !== undefined && (
            <WizardReport
              dashboardContext={this.state.dashboardContext}
              metricsCache={this.state.metricCache}
              modelCount={this.props.predictedY.length}
              performancePickerProps={performancePickerProps}
              onChartClick={this.onSelectModel}
              fairnessPickerProps={fairnessPickerProps}
              featureBinPickerProps={featureBinPickerProps}
              selectedModelIndex={this.state.selectedModelId}
              onEditConfigs={this.setTab.bind(this, featureBinTabKey)}
            />
          )}
        {this.state.activeTabKey === reportTabKey &&
          this.state.selectedModelId === undefined && (
            <ModelComparisonChart
              dashboardContext={this.state.dashboardContext}
              metricsCache={this.state.metricCache}
              onChartClick={this.onSelectModel}
              modelCount={this.props.predictedY.length}
              performancePickerProps={performancePickerProps}
              fairnessPickerProps={fairnessPickerProps}
              featureBinPickerProps={featureBinPickerProps}
              onEditConfigs={this.setTab.bind(this, featureBinTabKey)}
            />
          )}
      </Stack>
    );
  }

  private getPerformanceMetrics(
    fairnessContext: IRunTimeFairnessContext
  ): IPerformanceOption[] {
    if (
      fairnessContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
    ) {
      return this.props.supportedBinaryClassificationPerformanceKeys.map(
        (key) => performanceOptions[key]
      );
    }
    if (
      fairnessContext.modelMetadata.PredictionType ===
      PredictionTypes.Regression
    ) {
      return this.props.supportedRegressionPerformanceKeys.map(
        (key) => performanceOptions[key]
      );
    }
    return this.props.supportedProbabilityPerformanceKeys.map(
      (key) => performanceOptions[key]
    );
  }

  private readonly setTab = (key: string): void => {
    this.setState({ activeTabKey: key });
  };

  private readonly onSelectModel = (data: any): void => {
    if (!data) {
      this.setState({ selectedModelId: undefined });
      return;
    }
    if (data.points && data.points[0]) {
      this.setState({ selectedModelId: data.points[0].customdata });
    }
  };

  private readonly setPerformanceKey = (key: string): void => {
    const value: Partial<IWizardStateV1> = { selectedPerformanceKey: key };
    if (flights.skipFairness) {
      value.selectedFairnessKey = key;
    }
    this.setState(value as IWizardStateV1);
  };

  private readonly setFairnessKey = (key: string): void => {
    this.setState({ selectedFairnessKey: key });
  };

  private readonly setBinIndex = (index: number): void => {
    if (this.props.precomputedMetrics) {
      const newContext = _.cloneDeep(this.state.dashboardContext);

      newContext.binVector = this.props.precomputedFeatureBins[index].binVector;
      newContext.groupNames = this.props.precomputedFeatureBins[
        index
      ].binLabels;

      this.setState({ dashboardContext: newContext, selectedBinIndex: index });
    } else {
      this.binningSet(this.state.featureBins[index]);
    }
  };

  private readonly handleTabClick = (item: PivotItem | undefined): void => {
    if (item && item.props.itemKey) {
      this.setState({ activeTabKey: item.props.itemKey });
    }
  };

  private readonly binningSet = (value: IBinnedResponse): void => {
    if (!value || value.hasError || value.array.length === 0) {
      return;
    }
    const newContext = _.cloneDeep(this.state.dashboardContext);

    newContext.binVector = WizardBuilder.generateBinVectorForBin(
      value,
      this.state.dashboardContext.dataset
    );
    newContext.groupNames = value.labelArray;

    this.setState({
      dashboardContext: newContext,
      selectedBinIndex: value.featureIndex
    });
  };

  private readonly saveBin = (bin: IBinnedResponse): void => {
    const newBin = [...this.state.featureBins];
    newBin[bin.featureIndex] = bin;
    this.setState({ featureBins: newBin });
    this.state.metricCache.clearCache(bin.featureIndex);
    this.binningSet(bin);
  };
}
