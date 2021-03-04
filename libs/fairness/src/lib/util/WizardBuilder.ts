// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IFairnessBaseData,
  IRunTimeFairnessData,
  IPreComputedFairnessData,
  PredictionType,
  PredictionTypes,
  IPreComputedData
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  ModelMetadata,
  ICategoricalRange,
  RangeTypes
} from "@responsible-ai/mlchartlib";
import _ from "lodash";

import { BinnedResponseBuilder } from "./BinnedResponseBuilder";
import { IFairnessOption, fairnessOptions } from "./FairnessMetrics";
import { IBinnedResponse } from "./IBinnedResponse";
import {
  IRunTimeFairnessContext,
  IFairnessContext,
  IFairnessModelMetadata
} from "./IFairnessContext";
import { IPerformanceOption, performanceOptions } from "./PerformanceMetrics";

export class WizardBuilder {
  public static buildModelNames(props: IFairnessBaseData): string[] {
    return !!props.modelNames &&
      props.modelNames.length === props.predictedY.length
      ? props.modelNames
      : props.predictedY.map((_, modelIndex) => `Model ${modelIndex}`);
  }

  public static buildInitialFairnessContext(
    props: IRunTimeFairnessData
  ): IRunTimeFairnessContext {
    return {
      binVector: [],
      dataset: props.testData,
      groupNames: [],
      modelMetadata: this.buildModelMetadata(props),
      modelNames: this.buildModelNames(props),
      predictions: props.predictedY,
      trueY: props.trueY
    };
  }

  public static buildPrecomputedFairnessContext(
    props: IPreComputedFairnessData
  ): IFairnessContext {
    return {
      binVector: props.precomputedFeatureBins[0].binVector,
      dataset: undefined,
      groupNames: props.precomputedFeatureBins[0].binLabels,
      modelMetadata: this.buildPrecomputedModelMetadata(props),
      modelNames: this.buildModelNames(props),
      predictions: props.predictedY,
      trueY: props.trueY
    };
  }

  public static getClassLength(props: IFairnessBaseData): number {
    return _.uniq(props.trueY).length;
  }

  public static buildPrecomputedModelMetadata(
    props: IPreComputedFairnessData
  ): IFairnessModelMetadata {
    let featureNames = props.dataSummary?.featureNames;
    if (!featureNames) {
      featureNames = props.precomputedFeatureBins.map((binObject, index) => {
        return (
          binObject.featureBinName ||
          localization.formatString(
            localization.Fairness.defaultFeatureNames,
            index
          )
        );
      });
    }
    const classNames =
      props.dataSummary?.classNames ||
      this.buildIndexedNames(
        this.getClassLength(props),
        localization.Fairness.defaultClassNames
      );
    const featureRanges = props.precomputedFeatureBins.map((binMeta) => {
      return {
        rangeType: RangeTypes.Categorical,
        uniqueValues: binMeta.binLabels
      } as ICategoricalRange;
    });
    return {
      classNames,
      featureIsCategorical: props.precomputedFeatureBins.map(() => true),
      featureNames,
      featureNamesAbridged: featureNames,
      featureRanges,
      PredictionType: props.predictionType
    };
  }

  public static buildModelMetadata(
    props: IRunTimeFairnessData
  ): Required<IFairnessModelMetadata> {
    let featureNames = props.dataSummary?.featureNames;
    if (!featureNames) {
      let featureLength = 0;
      if (props.testData && props.testData[0] !== undefined) {
        featureLength = props.testData[0].length;
      }
      featureNames =
        featureLength === 1
          ? [localization.Fairness.defaultSingleFeatureName]
          : this.buildIndexedNames(
              featureLength,
              localization.Fairness.defaultFeatureNames
            );
    }
    const classNames =
      props.dataSummary?.classNames ||
      this.buildIndexedNames(
        this.getClassLength(props),
        localization.Fairness.defaultClassNames
      );
    const featureIsCategorical = ModelMetadata.buildIsCategorical(
      featureNames.length,
      props.testData,
      props.dataSummary?.categoricalMap
    );
    const featureRanges = ModelMetadata.buildFeatureRanges(
      props.testData,
      featureIsCategorical,
      props.dataSummary?.categoricalMap
    );
    const predictionType = this.determinePredictionType(
      props.trueY,
      props.predictedY,
      props.predictionType
    );
    return {
      classNames,
      featureIsCategorical,
      featureNames,
      featureNamesAbridged: featureNames,
      featureRanges,
      PredictionType: predictionType
    };
  }

  public static buildIndexedNames(
    length: number,
    baseString: string
  ): string[] {
    return [...new Array(length).keys()].map((i) =>
      localization.formatString(baseString, i.toString())
    );
  }

  public static determinePredictionType(
    trueY: number[],
    predictedY: number[][],
    specifiedType?: PredictionType
  ): PredictionType {
    if (
      specifiedType === PredictionTypes.BinaryClassification ||
      specifiedType === PredictionTypes.Probability ||
      specifiedType === PredictionTypes.Regression
    ) {
      return specifiedType;
    }
    const predictedIsPossibleProba = predictedY.every((predictionVector) =>
      predictionVector.every((x) => x >= 0 && x <= 1)
    );
    const trueIsBinary = _.uniq(trueY).length < 3;
    if (!trueIsBinary) {
      return PredictionTypes.Regression;
    }
    if (_.uniq(_.flatten(predictedY)).length < 3) {
      return PredictionTypes.BinaryClassification;
    }
    if (predictedIsPossibleProba) {
      return PredictionTypes.Probability;
    }
    return PredictionTypes.Regression;
  }

  public static buildPerformanceListForPrecomputedMetrics(
    props: IPreComputedFairnessData
  ): IPerformanceOption[] {
    const customMetrics: IPerformanceOption[] = [];
    const providedMetrics: IPerformanceOption[] = [];
    Object.keys(props.precomputedMetrics[0][0]).forEach((key) => {
      const metric = performanceOptions[key];
      if (metric !== undefined) {
        if (metric.userVisible) {
          providedMetrics.push(metric);
        }
      } else {
        const customMetric = props.customMetrics?.find(
          (metric) => metric.id === key
        );

        customMetrics.push({
          description: customMetric?.description,
          group: localization.Fairness.Metrics.Groups.custom,
          isMinimization: true,
          isPercentage: true,
          key,
          title:
            customMetric?.name ||
            localization.formatString(
              localization.Fairness.defaultCustomMetricName,
              customMetrics.length
            )
        });
      }
    });
    return customMetrics.concat(providedMetrics);
  }

  public static buildFairnessListForPrecomputedMetrics(
    props: IPreComputedData
  ): IFairnessOption[] {
    const customMetrics: IFairnessOption[] = [];
    const providedMetrics: IFairnessOption[] = [];
    // Every available precomputed metric can potentially be used for multiple fairness metrics.
    // To get all possible ones listed create a mapping from the underlying precomputed metric
    // to all the fairness metrics that can be calculated from it.
    const allFairnessMetrics: {
      [fairnessMetric: string]: IFairnessOption[];
    } = {};
    Object.values(fairnessOptions).forEach((fairnessOption) => {
      if (fairnessOption.fairnessMetric in allFairnessMetrics) {
        allFairnessMetrics[fairnessOption.fairnessMetric].push(fairnessOption);
      } else {
        allFairnessMetrics[fairnessOption.fairnessMetric] = [fairnessOption];
      }
    });
    Object.keys(props.precomputedMetrics[0][0]).forEach((key) => {
      if (key in allFairnessMetrics) {
        allFairnessMetrics[key].forEach((metric) => {
          if (metric !== undefined) {
            providedMetrics.push(metric);
          }
        });
      }
    });
    return customMetrics.concat(providedMetrics);
  }

  public static buildFeatureBins(
    fairnessContext: IRunTimeFairnessContext
  ): IBinnedResponse[] {
    return fairnessContext.modelMetadata.featureNames.map((_, index) => {
      return BinnedResponseBuilder.buildDefaultBin(
        fairnessContext.modelMetadata.featureRanges[index],
        index,
        fairnessContext.dataset
      );
    });
  }

  public static generateBinVectorForBin(
    value: IBinnedResponse,
    dataset: any[][] | undefined
  ): number[] {
    if (!dataset) {
      return [];
    }
    return dataset.map((row) => {
      const featureValue = row[value.featureIndex];
      if (value.rangeType === RangeTypes.Categorical) {
        // this handles categorical, as well as integers when user requests to treat as categorical
        return value.array.indexOf(featureValue);
      }
      return value.array.findIndex((upperLimit) => {
        return upperLimit >= featureValue;
      });
    });
  }
}
