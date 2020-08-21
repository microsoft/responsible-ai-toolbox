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
  loadTheme
} from "office-ui-fabric-react";
import React from "react";
import {
  IFairnessPropsV2,
  PredictionType,
  PredictionTypes
} from "../IFairnessProps";
import { AccuracyOptions, IAccuracyOption } from "./AccuracyMetrics";
import { AccuracyTab } from "./Controls/AccuracyTab";
import { FeatureTab } from "./Controls/FeatureTab";
import { IntroTab } from "./Controls/IntroTab";
import { ModelComparisonChart } from "./Controls/ModelComparisonChart";
import { ParityTab } from "./Controls/ParityTab";
import { IBinnedResponse } from "./IBinnedResponse";
import { IFairnessContext, IFairnessModelMetadata } from "./IFairnessContext";
import { localization } from "./../Localization/localization";
import { MetricsCache } from "./MetricsCache";
import { WizardReport } from "./WizardReport";
import { FairnessWizardStyles } from "./FairnessWizard.styles";
import { IParityOption, ParityOptions } from "./ParityMetrics";
import { BinnedResponseBuilder } from "./BinnedResponseBuilder";

import { defaultTheme } from "./Themes";

export interface IAccuracyPickerPropsV2 {
  accuracyOptions: IAccuracyOption[];
  selectedAccuracyKey: string;
  onAccuracyChange: (newKey: string) => void;
}

export interface IParityPickerPropsV2 {
  parityOptions: IParityOption[];
  selectedParityKey: string;
  onParityChange: (newKey: string) => void;
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
  accuracyMetrics: IAccuracyOption[];
  parityMetrics: IParityOption[];
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
  skipDisparity: false
};

export class FairnessWizardV2 extends React.PureComponent<
  IFairnessPropsV2,
  IWizardStateV2
> {
  private static iconsInitialized = false;

  public constructor(props: IFairnessPropsV2) {
    super(props);
    FairnessWizardV2.initializeIcons(props);
    if (this.props.locale) {
      localization.setLanguage(this.props.locale);
    }
    let accuracyMetrics: IAccuracyOption[];
    let parityMetrics: IParityOption[];
    loadTheme(props.theme || defaultTheme);
    // handle the case of precomputed metrics separately. As it becomes more defined, can integrate with existing code path.
    if (this.props.precomputedMetrics && this.props.precomputedFeatureBins) {
      // we must assume that the same accuracy metrics are provided across models and bins
      accuracyMetrics = this.buildAccuracyListForPrecomputedMetrics();
      parityMetrics = this.buildParityListForPrecomputedMetrics();
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
        showIntro: true,
        accuracyMetrics,
        selectedAccuracyKey: accuracyMetrics[0].key,
        parityMetrics,
        selectedParityKey: parityMetrics[0].key,
        dashboardContext: FairnessWizardV2.buildPrecomputedFairnessContext(
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
    const fairnessContext = FairnessWizardV2.buildInitialFairnessContext(props);

    const featureBins = this.buildFeatureBins(fairnessContext);
    if (featureBins.length > 0) {
      fairnessContext.binVector = this.generateBinVectorForBin(
        featureBins[0],
        fairnessContext.dataset
      );
      fairnessContext.groupNames = featureBins[0].labelArray;
    }

    accuracyMetrics =
      fairnessContext.modelMetadata.PredictionType ===
      PredictionTypes.binaryClassification
        ? this.props.supportedBinaryClassificationAccuracyKeys.map(
            (key) => AccuracyOptions[key]
          )
        : fairnessContext.modelMetadata.PredictionType ===
          PredictionTypes.regression
        ? this.props.supportedRegressionAccuracyKeys.map(
            (key) => AccuracyOptions[key]
          )
        : this.props.supportedProbabilityAccuracyKeys.map(
            (key) => AccuracyOptions[key]
          );
    accuracyMetrics = accuracyMetrics.filter((metric) => !!metric);

    // TODO
    parityMetrics = Object.values(ParityOptions);

    this.state = {
      showIntro: true,
      accuracyMetrics,
      selectedAccuracyKey: accuracyMetrics[0].key,
      parityMetrics,
      selectedParityKey: parityMetrics[0].key,
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

  private static initializeIcons(props: IFairnessPropsV2): void {
    if (
      FairnessWizardV2.iconsInitialized === false &&
      props.shouldInitializeIcons !== false
    ) {
      initializeIcons(props.iconUrl);
      FairnessWizardV2.iconsInitialized = true;
    }
  }

  private static buildModelNames(props: IFairnessPropsV2): string[] {
    return !!props.modelNames &&
      props.modelNames.length === props.predictedY.length
      ? props.modelNames
      : props.predictedY.map((_, modelIndex) => `Model ${modelIndex}`);
  }

  private static buildInitialFairnessContext(
    props: IFairnessPropsV2
  ): IFairnessContext {
    return {
      dataset: props.testData,
      trueY: props.trueY,
      predictions: props.predictedY,
      binVector: [],
      groupNames: [],
      modelMetadata: FairnessWizardV2.buildModelMetadata(props),
      modelNames: FairnessWizardV2.buildModelNames(props)
    };
  }

  private static buildPrecomputedFairnessContext(
    props: IFairnessPropsV2
  ): IFairnessContext {
    return {
      dataset: undefined,
      trueY: props.trueY,
      predictions: props.predictedY,
      binVector: props.precomputedFeatureBins[0].binVector,
      groupNames: props.precomputedFeatureBins[0].binLabels,
      modelMetadata: FairnessWizardV2.buildPrecomputedModelMetadata(props),
      modelNames: FairnessWizardV2.buildModelNames(props)
    };
  }

  private static getClassLength(props: IFairnessPropsV2): number {
    return _.uniq(props.trueY).length;
  }

  private static buildPrecomputedModelMetadata(
    props: IFairnessPropsV2
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
      FairnessWizardV2.buildIndexedNames(
        FairnessWizardV2.getClassLength(props),
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
      PredictionType: props.predictionType
    };
  }

  private static buildModelMetadata(
    props: IFairnessPropsV2
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
          : FairnessWizardV2.buildIndexedNames(
              featureLength,
              localization.defaultFeatureNames
            );
    }
    const classNames =
      props.dataSummary.classNames ||
      FairnessWizardV2.buildIndexedNames(
        FairnessWizardV2.getClassLength(props),
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
    const PredictionType = FairnessWizardV2.determinePredictionType(
      props.trueY,
      props.predictedY,
      props.predictionType
    );
    return {
      featureNames,
      featureNamesAbridged: featureNames,
      classNames,
      featureIsCategorical,
      featureRanges,
      PredictionType
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
    specifiedType?: PredictionType
  ): PredictionType {
    if (
      specifiedType === PredictionTypes.binaryClassification ||
      specifiedType === PredictionTypes.probability ||
      specifiedType === PredictionTypes.regression
    ) {
      return specifiedType;
    }
    const predictedIsPossibleProba = predictedY.every((predictionVector) =>
      predictionVector.every((x) => x >= 0 && x <= 1)
    );
    const trueIsBinary = _.uniq(trueY).length < 3;
    if (!trueIsBinary) {
      return PredictionTypes.regression;
    }
    if (_.uniq(_.flatten(predictedY)).length < 3) {
      return PredictionTypes.binaryClassification;
    }
    if (predictedIsPossibleProba) {
      return PredictionTypes.probability;
    }
    return PredictionTypes.regression;
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
          ></Stack>
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
        ></Stack>
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
                headerText={localization.sensitiveFeatures}
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
                <PivotItem
                  headerText={localization.disparityMetric}
                  itemKey={disparityTabKey}
                  style={{ height: "100%", paddingLeft: "8px" }}
                >
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
              showIntro={this.state.showIntro}
              dashboardContext={this.state.dashboardContext}
              metricsCache={this.state.metricCache}
              modelCount={this.props.predictedY.length}
              accuracyPickerProps={accuracyPickerProps}
              onChartClick={this.onSelectModel}
              parityPickerProps={parityPickerProps}
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
              accuracyPickerProps={accuracyPickerProps}
              parityPickerProps={parityPickerProps}
              featureBinPickerProps={featureBinPickerProps}
              onHideIntro={this.hideIntro.bind(this)}
              onEditConfigs={this.setTab.bind(this, featureBinTabKey)}
            />
          )}
      </Stack>
    );
  }

  private readonly hideIntro = (): void => {
    this.setState({ showIntro: false });
  };

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

  private readonly buildParityListForPrecomputedMetrics = (): IParityOption[] => {
    const customMetrics: IParityOption[] = [];
    const providedMetrics: IParityOption[] = [];
    Object.keys(this.props.precomputedMetrics[0][0]).forEach((key) => {
      const metric = ParityOptions[key];
      if (metric !== undefined) {
        // if (metric.userVisible) {
        providedMetrics.push(metric);
        // }
      } else {
        // const customIndex = this.props.customMetrics.findIndex((metric) => metric.id === key);
        // const customMetric = customIndex !== -1 ?
        //     this.props.customMetrics[customIndex] :
        //     {id: key};
        // customMetrics.push({
        //     key,
        //     title: customMetric.name ||
        //         localization.formatString(localization.defaultCustomMetricName, customMetrics.length) as string,
        //     description: customMetric.description
        // });
      }
    });
    return customMetrics.concat(providedMetrics);
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
      this.setState({ selectedModelId: data.points[0].customdata });
    }
  };

  private readonly setAccuracyKey = (key: string): void => {
    const value: Partial<IWizardStateV2> = { selectedAccuracyKey: key };
    if (flights.skipDisparity) {
      value.selectedParityKey = key;
    }
    this.setState(value as IWizardStateV2);
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
