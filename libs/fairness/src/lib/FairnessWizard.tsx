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
  loadTheme
} from "office-ui-fabric-react";
import React from "react";

import { EmptyHeader } from "./Controls/EmptyHeader";
import { FairnessTab } from "./Controls/FairnessTab";
import { FeatureTab } from "./Controls/FeatureTab";
import { IntroTab } from "./Controls/IntroTab";
import { ModelComparisonChart } from "./Controls/ModelComparisonChart";
import { PerformanceTab } from "./Controls/PerformanceTab";
import { FairnessWizardStyles } from "./FairnessWizard.styles";
import { IFairnessProps } from "./IFairnessProps";
import { defaultTheme } from "./Themes";
import { IErrorOption } from "./util/ErrorMetrics";
import {
  IFairnessOption,
  fairnessOptions,
  defaultFairnessMetricPrioritization
} from "./util/FairnessMetrics";
import { IBinnedResponse } from "./util/IBinnedResponse";
import {
  IFairnessContext,
  IRunTimeFairnessContext
} from "./util/IFairnessContext";
import { MetricsCache } from "./util/MetricsCache";
import {
  performanceOptions,
  IPerformanceOption,
  defaultPerformanceMetricPrioritization
} from "./util/PerformanceMetrics";
import { WizardBuilder } from "./util/WizardBuilder";
import { WizardReport } from "./WizardReport";

export interface IPerformancePickerPropsV2 {
  performanceOptions: IPerformanceOption[];
  selectedPerformanceKey: string;
  onPerformanceChange: (newKey: string) => void;
}

export interface IFairnessPickerPropsV2 {
  fairnessOptions: IFairnessOption[];
  selectedFairnessKey: string;
  onFairnessChange: (newKey: string) => void;
}

export interface IErrorPickerPropsV2 {
  errorOptions?: IErrorOption[];
  selectedErrorKey: string;
  onErrorChange: (newKey: string) => void;
}

export interface IFeatureBinPickerPropsV2 {
  featureBins: IBinnedResponse[];
  selectedBinIndex: number;
  onBinChange: (index: number) => void;
}

export interface IWizardStateV2 {
  showIntro: boolean;
  activeTabKey: string;
  selectedModelId?: number;
  dashboardContext: IFairnessContext;
  performanceMetrics: IPerformanceOption[];
  fairnessMetrics: IFairnessOption[];
  errorMetrics?: IErrorOption[];
  selectedPerformanceKey: string;
  selectedFairnessKey: string;
  selectedErrorKey: string;
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
  skipFairness: false
};

export class FairnessWizardV2 extends React.PureComponent<
  IFairnessProps,
  IWizardStateV2
> {
  public constructor(props: IFairnessProps) {
    super(props);
    if (this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
    let performanceMetrics: IPerformanceOption[];
    let fairnessMetrics: IFairnessOption[];
    let selectedPerformanceKey: string;
    let selectedFairnessKey: string;
    let selectedErrorKey: string;
    loadTheme(props.theme || defaultTheme);
    // handle the case of precomputed metrics separately. As it becomes more defined, can integrate with existing code path.
    if (this.props.precomputedMetrics && this.props.precomputedFeatureBins) {
      // we must assume that the same performance metrics are provided across models and bins
      performanceMetrics = WizardBuilder.buildPerformanceListForPrecomputedMetrics(
        this.props
      );
      fairnessMetrics = WizardBuilder.buildFairnessListForPrecomputedMetrics(
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
      selectedPerformanceKey = this.selectDefaultMetric(
        performanceMetrics,
        defaultPerformanceMetricPrioritization
      );
      selectedFairnessKey = this.selectDefaultMetric(
        fairnessMetrics,
        defaultFairnessMetricPrioritization
      );
      selectedErrorKey = "enabled";

      this.state = {
        activeTabKey: featureBinTabKey,
        dashboardContext: WizardBuilder.buildPrecomputedFairnessContext(
          this.props
        ),
        fairnessMetrics,
        featureBins: readonlyFeatureBins,
        metricCache: new MetricsCache(
          0,
          0,
          undefined,
          props.precomputedMetrics
        ),
        performanceMetrics,
        selectedBinIndex: 0,
        selectedErrorKey,
        selectedFairnessKey,
        selectedModelId: this.props.predictedY.length === 1 ? 0 : undefined,
        selectedPerformanceKey,
        showIntro: true
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
    selectedPerformanceKey = this.selectDefaultMetric(
      performanceMetrics,
      defaultPerformanceMetricPrioritization
    );

    fairnessMetrics = this.getFairnessMetrics(fairnessContext);
    fairnessMetrics = fairnessMetrics.filter((metric) => !!metric);
    selectedFairnessKey = this.selectDefaultMetric(
      fairnessMetrics,
      defaultFairnessMetricPrioritization
    );

    selectedErrorKey = "enabled";

    this.state = {
      activeTabKey: introTabKey,
      dashboardContext: fairnessContext,
      fairnessMetrics,
      featureBins,
      metricCache: new MetricsCache(
        featureBins.length,
        this.props.predictedY.length,
        this.props.requestMetrics
      ),
      performanceMetrics,
      selectedBinIndex: 0,
      selectedErrorKey,
      selectedFairnessKey,
      selectedModelId: this.props.predictedY.length === 1 ? 0 : undefined,
      selectedPerformanceKey,
      showIntro: true
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
    const errorPickerProps = {
      errorOptions: this.state.errorMetrics,
      onErrorChange: this.setErrorKey,
      selectedErrorKey: this.state.selectedErrorKey
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
        </Stack>
      );
    }
    return (
      <Stack className={styles.frame}>
        <EmptyHeader />
        {this.state.activeTabKey === introTabKey && (
          <StackItem grow={2}>
            <IntroTab onNext={this.setTab.bind(this, featureBinTabKey)} />
          </StackItem>
        )}
        {(this.state.activeTabKey === featureBinTabKey ||
          this.state.activeTabKey === performanceTabKey ||
          this.state.activeTabKey === fairnessTabKey) && (
          <Stack.Item grow={2}>
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
                headerText={localization.Fairness.sensitiveFeatures}
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
                headerText={localization.Fairness.performanceMetric}
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
                <PivotItem
                  headerText={localization.Fairness.fairnessMetric}
                  itemKey={fairnessTabKey}
                  style={{ height: "100%", paddingLeft: "8px" }}
                >
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
              showIntro={this.state.showIntro}
              dashboardContext={this.state.dashboardContext}
              metricsCache={this.state.metricCache}
              modelCount={this.props.predictedY.length}
              performancePickerProps={performancePickerProps}
              onChartClick={this.onSelectModel}
              fairnessPickerProps={fairnessPickerProps}
              errorPickerProps={errorPickerProps}
              featureBinPickerProps={featureBinPickerProps}
              selectedModelIndex={this.state.selectedModelId}
              onHideIntro={this.hideIntro.bind(this)}
              onEditConfigs={this.setTab.bind(this, featureBinTabKey)}
            />
          )}
        {this.state.activeTabKey === reportTabKey &&
          this.state.selectedModelId === undefined && (
            <ModelComparisonChart
              showIntro={this.state.showIntro}
              dashboardContext={this.state.dashboardContext}
              metricsCache={this.state.metricCache}
              onChartClick={this.onSelectModel}
              modelCount={this.props.predictedY.length}
              performancePickerProps={performancePickerProps}
              fairnessPickerProps={fairnessPickerProps}
              errorPickerProps={errorPickerProps}
              featureBinPickerProps={featureBinPickerProps}
              onHideIntro={this.hideIntro.bind(this)}
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

  private getFairnessMetrics(
    fairnessContext: IRunTimeFairnessContext
  ): IFairnessOption[] {
    return Object.values(fairnessOptions).filter((fairnessOption) => {
      return fairnessOption.supportedTasks.has(
        fairnessContext.modelMetadata.PredictionType
      );
    });
  }

  private readonly hideIntro = (): void => {
    this.setState({ showIntro: false });
  };

  private readonly setTab = (key: string): void => {
    this.setState({ activeTabKey: key });
  };

  private readonly onSelectModel = (data: any): void => {
    if (!data) {
      this.setState({ selectedModelId: undefined });
      return;
    }
    if (data.points && data.points[0]) {
      this.setState({ selectedModelId: data.points[0].customdata.modelId });
    }
  };

  private readonly setPerformanceKey = (key: string): void => {
    const value: Partial<IWizardStateV2> = { selectedPerformanceKey: key };
    if (flights.skipFairness) {
      value.selectedFairnessKey = key;
    }
    this.setState(value as IWizardStateV2);
  };

  private readonly setFairnessKey = (key: string): void => {
    this.setState({ selectedFairnessKey: key });
  };

  private readonly setErrorKey = (key: string): void => {
    this.setState({ selectedErrorKey: key });
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

  private readonly handleTabClick = (item?: PivotItem): void => {
    if (item?.props?.itemKey) {
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

  private selectDefaultMetric(
    metrics: { [key: string]: any },
    prioritization: string[]
  ): string {
    const keys = new Set(Object.values(metrics).map((metric) => metric.key));
    for (const metricKey of prioritization) {
      if (keys.has(metricKey)) {
        return metricKey;
      }
    }

    // if none of the prioritized default metrics are available return first item
    return metrics[0].key;
  }
}
