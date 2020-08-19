import { initializeIcons } from "@uifabric/icons";
import _ from "lodash";
import {
  ICategoricalRange,
  ModelMetadata,
  RangeTypes
} from "@responsible-ai/mlchartlib";
import {
  Pivot,
  PivotItem,
  Stack,
  StackItem,
  Text,
  loadTheme
} from "office-ui-fabric-react";
import React from "react";
import { AccuracyOptions, IAccuracyOption } from "./AccuracyMetrics";
import { BinnedResponseBuilder } from "./BinnedResponseBuilder";
import { AccuracyTab } from "./Controls/AccuracyTab";
import { FeatureTab } from "./Controls/FeatureTab";
import { IntroTab } from "./Controls/IntroTab";
import { ModelComparisonChart } from "./Controls/ModelComparisonChart";
import { ParityTab } from "./Controls/ParityTab";
import { IBinnedResponse } from "./IBinnedResponse";
import { IFairnessContext, IFairnessModelMetadata } from "./IFairnessContext";
import {
  IFairnessPropsV1,
  PredictionTypeV1,
  PredictionTypesV1
} from "./IFairnessProps";
import { localization } from "./../Localization/localization";
import { MetricsCache } from "./MetricsCache";
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
  IFairnessPropsV1,
  IWizardStateV1
> {
  private static iconsInitialized = false;

  public constructor(props: IFairnessPropsV1) {
    super(props);
    FairnessWizardV1.initializeIcons(props);
    if (this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
    let accuracyMetrics: IAccuracyOption[];
    loadTheme(props.theme || defaultTheme);
    // handle the case of precomputed metrics separately. As it becomes more defined, can integrate with existing code path.
    if (this.props.precomputedMetrics && this.props.precomputedFeatureBins) {
      // we must assume that the same accuracy metrics are provided across models and bins
      accuracyMetrics = this.buildAccuracyListForPrecomputedMetrics();
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
        dashboardContext: FairnessWizardV1.buildPrecomputedFairnessContext(
          props
        ),
        activeTabKey: featureBinTabKey,
        featureBins: readonlyFeatureBins,
        selectedBinIndex: 0,
        selectedModelId: this.props.predictedY.length === 1 ? 0 : undefined,
        metricCache: new MetricsCache(0, 0, undefined, props.precomputedMetrics)
      };
      return;
    }
    const fairnessContext = FairnessWizardV1.buildInitialFairnessContext(props);

    const featureBins = this.buildFeatureBins(fairnessContext);
    if (featureBins.length > 0) {
      fairnessContext.binVector = this.generateBinVectorForBin(
        featureBins[0],
        fairnessContext.dataset
      );
      fairnessContext.groupNames = featureBins[0].labelArray;
    }

    accuracyMetrics =
      fairnessContext.modelMetadata.PredictionTypeV1 ===
      PredictionTypesV1.binaryClassification
        ? this.props.supportedBinaryClassificationAccuracyKeys.map(
            (key) => AccuracyOptions[key]
          )
        : fairnessContext.modelMetadata.PredictionTypeV1 ===
          PredictionTypesV1.regression
        ? this.props.supportedRegressionAccuracyKeys.map(
            (key) => AccuracyOptions[key]
          )
        : this.props.supportedProbabilityAccuracyKeys.map(
            (key) => AccuracyOptions[key]
          );
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

  private static initializeIcons(props: IFairnessPropsV1): void {
    if (
      FairnessWizardV1.iconsInitialized === false &&
      props.shouldInitializeIcons !== false
    ) {
      initializeIcons(props.iconUrl);
      FairnessWizardV1.iconsInitialized = true;
    }
  }

  private static buildModelNames(props: IFairnessPropsV1): string[] {
    return !!props.modelNames &&
      props.modelNames.length === props.predictedY.length
      ? props.modelNames
      : props.predictedY.map((_, modelIndex) => `Model ${modelIndex}`);
  }

  private static buildInitialFairnessContext(
    props: IFairnessPropsV1
  ): IFairnessContext {
    return {
      dataset: props.testData,
      trueY: props.trueY,
      predictions: props.predictedY,
      binVector: [],
      groupNames: [],
      modelMetadata: FairnessWizardV1.buildModelMetadata(props),
      modelNames: FairnessWizardV1.buildModelNames(props)
    };
  }

  private static buildPrecomputedFairnessContext(
    props: IFairnessPropsV1
  ): IFairnessContext {
    return {
      dataset: undefined,
      trueY: props.trueY,
      predictions: props.predictedY,
      binVector: props.precomputedFeatureBins[0].binVector,
      groupNames: props.precomputedFeatureBins[0].binLabels,
      modelMetadata: FairnessWizardV1.buildPrecomputedModelMetadata(props),
      modelNames: FairnessWizardV1.buildModelNames(props)
    };
  }

  private static getClassLength(props: IFairnessPropsV1): number {
    return _.uniq(props.trueY).length;
  }

  private static buildPrecomputedModelMetadata(
    props: IFairnessPropsV1
  ): IFairnessModelMetadata {
    let featureNames = props.dataSummary.featureNames;
    if (!featureNames) {
      featureNames = props.precomputedFeatureBins.map((binObject, index) => {
        return (
          binObject.featureBinName ||
          localization.formatString(localization.defaultFeatureNames, index)
        );
      }) as string[];
    }
    const classNames =
      props.dataSummary.classNames ||
      FairnessWizardV1.buildIndexedNames(
        FairnessWizardV1.getClassLength(props),
        localization.defaultClassNames
      );
    const featureRanges = props.precomputedFeatureBins.map((binMeta) => {
      return {
        uniqueValues: binMeta.binLabels,
        rangeType: RangeTypes.categorical
      } as ICategoricalRange;
    });
    return {
      featureNames,
      featureNamesAbridged: featureNames,
      classNames,
      featureIsCategorical: props.precomputedFeatureBins.map(() => true),
      featureRanges,
      PredictionTypeV1: props.PredictionTypeV1
    };
  }

  private static buildModelMetadata(
    props: IFairnessPropsV1
  ): IFairnessModelMetadata {
    let featureNames = props.dataSummary.featureNames;
    if (!featureNames) {
      let featureLength = 0;
      if (props.testData && props.testData[0] !== undefined) {
        featureLength = props.testData[0].length;
      }
      featureNames =
        featureLength === 1
          ? [localization.defaultSingleFeatureName]
          : FairnessWizardV1.buildIndexedNames(
              featureLength,
              localization.defaultFeatureNames
            );
    }
    const classNames =
      props.dataSummary.classNames ||
      FairnessWizardV1.buildIndexedNames(
        FairnessWizardV1.getClassLength(props),
        localization.defaultClassNames
      );
    const featureIsCategorical = ModelMetadata.buildIsCategorical(
      featureNames.length,
      props.testData,
      props.dataSummary.categoricalMap
    );
    const featureRanges = ModelMetadata.buildFeatureRanges(
      props.testData,
      featureIsCategorical,
      props.dataSummary.categoricalMap
    );
    const PredictionTypeV1 = FairnessWizardV1.determinePredictionType(
      props.trueY,
      props.predictedY,
      props.PredictionTypeV1
    );
    return {
      featureNames,
      featureNamesAbridged: featureNames,
      classNames,
      featureIsCategorical,
      featureRanges,
      PredictionTypeV1
    };
  }

  private static buildIndexedNames(
    length: number,
    baseString: string
  ): string[] {
    return Array.from(Array(length).keys()).map(
      (i) => localization.formatString(baseString, i.toString()) as string
    );
  }

  private static determinePredictionType(
    trueY: number[],
    predictedY: number[][],
    specifiedType?: PredictionTypeV1
  ): PredictionTypeV1 {
    if (
      specifiedType === PredictionTypesV1.binaryClassification ||
      specifiedType === PredictionTypesV1.probability ||
      specifiedType === PredictionTypesV1.regression
    ) {
      return specifiedType;
    }
    const predictedIsPossibleProba = predictedY.every((predictionVector) =>
      predictionVector.every((x) => x >= 0 && x <= 1)
    );
    const trueIsBinary = _.uniq(trueY).length < 3;
    if (!trueIsBinary) {
      return PredictionTypesV1.regression;
    }
    if (_.uniq(_.flatten(predictedY)).length < 3) {
      return PredictionTypesV1.binaryClassification;
    }
    if (predictedIsPossibleProba) {
      return PredictionTypesV1.probability;
    }
    return PredictionTypesV1.regression;
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
                headerText={localization.accuracyMetric}
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

  private readonly buildAccuracyListForPrecomputedMetrics = (): IAccuracyOption[] => {
    const customMetrics: IAccuracyOption[] = [];
    const providedMetrics: IAccuracyOption[] = [];
    Object.keys(this.props.precomputedMetrics[0][0]).forEach((key) => {
      const metric = AccuracyOptions[key];
      if (metric !== undefined) {
        if (metric.userVisible) {
          providedMetrics.push(metric);
        }
      } else {
        const customIndex = this.props.customMetrics.findIndex(
          (metric) => metric.id === key
        );
        const customMetric =
          customIndex !== -1
            ? this.props.customMetrics[customIndex]
            : { id: key };

        customMetrics.push({
          key,
          title:
            customMetric.name ||
            (localization.formatString(
              localization.defaultCustomMetricName,
              customMetrics.length
            ) as string),
          isMinimization: true,
          isPercentage: true,
          description: customMetric.description
        });
      }
    });
    return customMetrics.concat(providedMetrics);
  };

  private readonly setTab = (key: string): void => {
    this.setState({ activeTabKey: key });
  };

  private readonly onSelectModel = (data: any): void => {
    console.log(data);
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

  private readonly handleTabClick = (item: PivotItem): void => {
    this.setState({ activeTabKey: item.props.itemKey });
  };

  private readonly binningSet = (value: IBinnedResponse): void => {
    if (!value || value.hasError || value.array.length === 0) {
      return;
    }
    const newContext = _.cloneDeep(this.state.dashboardContext);

    newContext.binVector = this.generateBinVectorForBin(
      value,
      this.state.dashboardContext.dataset
    );
    newContext.groupNames = value.labelArray;

    this.setState({
      dashboardContext: newContext,
      selectedBinIndex: value.featureIndex
    });
  };

  private generateBinVectorForBin(
    value: IBinnedResponse,
    dataset: any[][]
  ): number[] {
    return dataset.map((row) => {
      const featureValue = row[value.featureIndex];
      if (value.rangeType === RangeTypes.categorical) {
        // this handles categorical, as well as integers when user requests to treat as categorical
        return value.array.indexOf(featureValue);
      }
      return value.array.findIndex((upperLimit) => {
        return upperLimit >= featureValue;
      });
    });
  }

  private readonly buildFeatureBins = (
    fairnessContext: IFairnessContext
  ): IBinnedResponse[] => {
    return fairnessContext.modelMetadata.featureNames.map((_, index) => {
      return BinnedResponseBuilder.buildDefaultBin(
        fairnessContext.modelMetadata.featureRanges[index],
        index,
        fairnessContext.dataset
      );
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
