import _ from "lodash";
import { RangeTypes } from "@responsible-ai/mlchartlib";
import {
  Pivot,
  PivotItem,
  Stack,
  StackItem,
  Text,
  loadTheme
} from "office-ui-fabric-react";
import React from "react";
import { IFairnessProps, PredictionTypes } from "../IFairnessProps";
import { WizardBuilder } from "../util/WizardBuilder";
import { IBinnedResponse } from "../util/IBinnedResponse";
import {
  IFairnessContext,
  IRunTimeFairnessContext
} from "../util/IFairnessContext";
import { IAccuracyOption, accuracyOptions } from "../util/AccuracyMetrics";
import { MetricsCache } from "../util/MetricsCache";
import { FeatureTab } from "../components/FeatureTab";
import { AccuracyTab } from "./Controls/AccuracyTab";
import { IntroTab } from "./Controls/IntroTab";
import { ModelComparisonChart } from "./Controls/ModelComparisonChart";
import { ParityTab } from "./Controls/ParityTab";
import { localization } from "./../Localization/localization";
import { WizardReport } from "./WizardReport";
import { FairnessWizardStyles } from "./FairnessWizard.styles";
import { defaultTheme } from "./Themes";

export interface IAccuracyPickerPropsV1 {
  accuracyOptions: IAccuracyOption[];
  selectedAccuracyKey: string;
  onAccuracyChange: (newKey: string) => void;
}

export interface IParityPickerPropsV1 {
  parityOptions: IAccuracyOption[];
  selectedParityKey: string;
  onParityChange: (newKey: string) => void;
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
  accuracyMetrics: IAccuracyOption[];
  parityMetrics: IAccuracyOption[];
  selectedAccuracyKey: string;
  selectedParityKey: string;
  featureBins: IBinnedResponse[];
  selectedBinIndex: number;
  metricCache: MetricsCache;
}

const introTabKey = "introTab";
const featureBinTabKey = "featureBinTab";
const accuracyTabKey = "accuracyTab";
const disparityTabKey = "disparityTab";
const reportTabKey = "reportTab";

const flights = {
  skipDisparity: true
};

export class FairnessWizardV1 extends React.PureComponent<
  IFairnessProps,
  IWizardStateV1
> {
  public constructor(props: IFairnessProps) {
    super(props);
    WizardBuilder.initializeIcons(props);
    if (this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
    let accuracyMetrics: IAccuracyOption[];
    loadTheme(props.theme || defaultTheme);
    // handle the case of precomputed metrics separately. As it becomes more defined, can integrate with existing code path.
    if (this.props.precomputedMetrics && this.props.precomputedFeatureBins) {
      // we must assume that the same accuracy metrics are provided across models and bins
      accuracyMetrics = WizardBuilder.buildAccuracyListForPrecomputedMetrics(
        this.props
      );
      const readonlyFeatureBins = this.props.precomputedFeatureBins.map(
        (initialBin, index) => {
          return {
            hasError: false,
            array: initialBin.binLabels,
            labelArray: initialBin.binLabels,
            featureIndex: index,
            rangeType: RangeTypes.categorical
          };
        }
      );
      this.state = {
        accuracyMetrics,
        selectedAccuracyKey: accuracyMetrics[0].key,
        parityMetrics: accuracyMetrics,
        selectedParityKey: accuracyMetrics[0].key,
        dashboardContext: WizardBuilder.buildPrecomputedFairnessContext(
          this.props
        ),
        activeTabKey: featureBinTabKey,
        featureBins: readonlyFeatureBins,
        selectedBinIndex: 0,
        selectedModelId: this.props.predictedY.length === 1 ? 0 : undefined,
        metricCache: new MetricsCache(0, 0, undefined, props.precomputedMetrics)
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

    accuracyMetrics = this.getAccuracyMetrics(fairnessContext);
    accuracyMetrics = accuracyMetrics.filter((metric) => !!metric);

    this.state = {
      accuracyMetrics,
      selectedAccuracyKey: accuracyMetrics[0].key,
      parityMetrics: accuracyMetrics,
      selectedParityKey: accuracyMetrics[0].key,
      dashboardContext: fairnessContext,
      activeTabKey: introTabKey,
      featureBins,
      selectedBinIndex: 0,
      selectedModelId: this.props.predictedY.length === 1 ? 0 : undefined,
      metricCache: new MetricsCache(
        featureBins.length,
        this.props.predictedY.length,
        this.props.requestMetrics
      )
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
    const accuracyPickerProps = {
      accuracyOptions: this.state.accuracyMetrics,
      selectedAccuracyKey: this.state.selectedAccuracyKey,
      onAccuracyChange: this.setAccuracyKey
    };
    const parityPickerProps = {
      parityOptions: this.state.parityMetrics,
      selectedParityKey: this.state.selectedParityKey,
      onParityChange: this.setParityKey
    };
    const featureBinPickerProps = {
      featureBins: this.state.featureBins,
      selectedBinIndex: this.state.selectedBinIndex,
      onBinChange: this.setBinIndex
    };
    if (this.state.featureBins.length === 0) {
      return (
        <Stack className={styles.frame}>
          <Stack
            horizontal
            horizontalAlign="space-between"
            verticalAlign="center"
            className={styles.thinHeader}
          >
            {/* <Text variant={"mediumPlus"} className={styles.headerLeft}>
              {localization.Header.title}
            </Text> */}
          </Stack>
          <Stack.Item grow={2} className={styles.body}>
            <Text variant={"mediumPlus"}>{localization.errorOnInputs}</Text>
          </Stack.Item>
        </Stack>
      );
    }
    return (
      <Stack className={styles.frame}>
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
          className={styles.thinHeader}
        >
          {/* <Text variant={"mediumPlus"} className={styles.headerLeft}>
            {localization.Header.title}
          </Text> */}
        </Stack>
        {this.state.activeTabKey === introTabKey && (
          <StackItem grow={2} className={styles.body}>
            <IntroTab onNext={this.setTab.bind(this, featureBinTabKey)} />
          </StackItem>
        )}
        {(this.state.activeTabKey === featureBinTabKey ||
          this.state.activeTabKey === accuracyTabKey ||
          this.state.activeTabKey === disparityTabKey) && (
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
                headerText={localization.Intro.features}
                itemKey={featureBinTabKey}
                style={{ height: "100%", paddingLeft: "8px" }}
              >
                <FeatureTab
                  dashboardContext={this.state.dashboardContext}
                  selectedFeatureChange={this.setBinIndex}
                  selectedFeatureIndex={this.state.selectedBinIndex}
                  featureBins={this.state.featureBins.filter((x) => !!x)}
                  onNext={this.setTab.bind(this, accuracyTabKey)}
                  saveBin={this.saveBin}
                />
              </PivotItem>
              <PivotItem
                headerText={localization.accuracyMetricLegacy}
                itemKey={accuracyTabKey}
                style={{ height: "100%", paddingLeft: "8px" }}
              >
                <AccuracyTab
                  dashboardContext={this.state.dashboardContext}
                  accuracyPickerProps={accuracyPickerProps}
                  onNext={this.setTab.bind(
                    this,
                    flights.skipDisparity ? reportTabKey : disparityTabKey
                  )}
                  onPrevious={this.setTab.bind(this, featureBinTabKey)}
                />
              </PivotItem>
              {flights.skipDisparity === false && (
                <PivotItem headerText={"Parity"} itemKey={disparityTabKey}>
                  <ParityTab
                    dashboardContext={this.state.dashboardContext}
                    parityPickerProps={parityPickerProps}
                    onNext={this.setTab.bind(this, reportTabKey)}
                    onPrevious={this.setTab.bind(this, accuracyTabKey)}
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
              accuracyPickerProps={accuracyPickerProps}
              onChartClick={this.onSelectModel}
              parityPickerProps={parityPickerProps}
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
              accuracyPickerProps={accuracyPickerProps}
              parityPickerProps={parityPickerProps}
              featureBinPickerProps={featureBinPickerProps}
              onEditConfigs={this.setTab.bind(this, featureBinTabKey)}
            />
          )}
      </Stack>
    );
  }

  private getAccuracyMetrics(
    fairnessContext: IRunTimeFairnessContext
  ): IAccuracyOption[] {
    if (
      fairnessContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
    ) {
      return this.props.supportedBinaryClassificationAccuracyKeys.map(
        (key) => accuracyOptions[key]
      );
    }
    if (
      fairnessContext.modelMetadata.PredictionType ===
      PredictionTypes.Regression
    ) {
      return this.props.supportedRegressionAccuracyKeys.map(
        (key) => accuracyOptions[key]
      );
    }
    return this.props.supportedProbabilityAccuracyKeys.map(
      (key) => accuracyOptions[key]
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

  private readonly setAccuracyKey = (key: string): void => {
    const value: Partial<IWizardStateV1> = { selectedAccuracyKey: key };
    if (flights.skipDisparity) {
      value.selectedParityKey = key;
    }
    this.setState(value as IWizardStateV1);
  };

  private readonly setParityKey = (key: string): void => {
    this.setState({ selectedParityKey: key });
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
