// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  IMultiClassLocalFeatureImportance,
  ISingleClassLocalFeatureImportance,
  WeightVectors,
  JointDataset,
  IExplanationModelMetadata,
  ModelTypes
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { ModelMetadata } from "@responsible-ai/mlchartlib";

import {
  GlobalTabKeys,
  IExplanationDashboardProps,
  INewExplanationDashboardState
} from "./Interfaces/IExplanationDashboardProps";
import { TelemetryLevels } from "./Interfaces/ITelemetryMessage";
import { getClassLength } from "./utils/getClassLength";
import { ValidateProperties } from "./ValidateProperties";

const rowWarningSize = 6000;
function getModelType(props: IExplanationDashboardProps): ModelTypes {
  // If python gave us a hint, use it
  if (props.modelInformation.method === "regressor") {
    return ModelTypes.Regression;
  }
  switch (getClassLength(props)) {
    case 1:
      return ModelTypes.Regression;
    case 2:
      return ModelTypes.Binary;
    default:
      return ModelTypes.Multiclass;
  }
}
function buildIndexedNames(length: number, baseString: string): string[] {
  return new Array(length)
    .fill(baseString)
    .map((s, i) => localization.formatString(s, i.toString()));
}
function buildModelMetadata(
  props: IExplanationDashboardProps
): IExplanationModelMetadata {
  const modelType = getModelType(props);
  let featureNames = props.dataSummary.featureNames;
  let featureNamesAbridged: string[];
  const maxLength = 18;
  if (featureNames !== undefined) {
    if (!featureNames.every((name) => typeof name === "string")) {
      featureNames = featureNames.map((x) => x.toString());
    }
    featureNamesAbridged = featureNames.map((name) => {
      return name.length <= maxLength ? name : `${name.slice(0, maxLength)}...`;
    });
  } else {
    let featureLength = 0;
    if (props.testData && props.testData[0] !== undefined) {
      featureLength = props.testData[0].length;
    } else if (
      props.precomputedExplanations &&
      props.precomputedExplanations.globalFeatureImportance
    ) {
      featureLength =
        props.precomputedExplanations.globalFeatureImportance.scores.length;
    } else if (
      props.precomputedExplanations &&
      props.precomputedExplanations.localFeatureImportance
    ) {
      const localImportances =
        props.precomputedExplanations.localFeatureImportance.scores;
      if (
        (localImportances as number[][][]).every((dim1) => {
          return dim1.every((dim2) => Array.isArray(dim2));
        })
      ) {
        featureLength = (props.precomputedExplanations.localFeatureImportance
          .scores[0][0] as number[]).length;
      } else {
        featureLength = (props.precomputedExplanations.localFeatureImportance
          .scores[0] as number[]).length;
      }
    } else if (
      props.precomputedExplanations &&
      props.precomputedExplanations.ebmGlobalExplanation
    ) {
      featureLength =
        props.precomputedExplanations.ebmGlobalExplanation.feature_list.length;
    }
    featureNames = buildIndexedNames(
      featureLength,
      localization.Interpret.defaultFeatureNames
    );
    featureNamesAbridged = featureNames;
  }
  let classNames = props.dataSummary.classNames;
  const classLength = getClassLength(props);
  if (!classNames || classNames.length !== classLength) {
    classNames = buildIndexedNames(
      classLength,
      localization.Interpret.defaultClassNames
    );
  }
  const featureIsCategorical = ModelMetadata.buildIsCategorical(
    featureNames.length,
    props.testData,
    props.dataSummary.categoricalMap
  );
  const featureRanges =
    ModelMetadata.buildFeatureRanges(
      props.testData,
      featureIsCategorical,
      props.dataSummary.categoricalMap
    ) || [];
  return {
    classNames,
    featureIsCategorical,
    featureNames,
    featureNamesAbridged,
    featureRanges,
    modelType
  };
}

export function buildInitialExplanationContext(
  props: IExplanationDashboardProps
): INewExplanationDashboardState {
  const modelMetadata = buildModelMetadata(props);
  const validationCheck = new ValidateProperties(props, modelMetadata);

  let localExplanations:
    | IMultiClassLocalFeatureImportance
    | ISingleClassLocalFeatureImportance
    | undefined;
  if (props?.precomputedExplanations?.localFeatureImportance?.scores) {
    localExplanations = props.precomputedExplanations.localFeatureImportance;
  }
  const jointDataset = new JointDataset({
    dataset: props.testData,
    localExplanations,
    metadata: modelMetadata,
    predictedProbabilities: props.probabilityY,
    predictedY: props.predictedY,
    trueY: props.trueY
  });
  // consider taking filters in as param arg for programmatic users
  const cohorts = [
    new Cohort(localization.Interpret.Cohort.defaultLabel, jointDataset, [])
  ];
  if (
    validationCheck.errorStrings.length !== 0 &&
    props.telemetryHook !== undefined
  ) {
    props.telemetryHook({
      context: validationCheck.errorStrings.length,
      level: TelemetryLevels.Error,
      message: "Invalid inputs"
    });
  }
  const weightVectorLabels = {
    [WeightVectors.AbsAvg]: localization.Interpret.absoluteAverage
  };
  const weightVectorOptions = [];
  if (modelMetadata.modelType === ModelTypes.Multiclass) {
    weightVectorOptions.push(WeightVectors.AbsAvg);
  }
  modelMetadata.classNames.forEach((name, index) => {
    weightVectorLabels[index] = localization.formatString(
      localization.Interpret.WhatIfTab.classLabel,
      name
    );
    weightVectorOptions.push(index);
  });
  return {
    activeGlobalTab: GlobalTabKeys.ModelPerformance,
    cohorts,
    jointDataset,
    modelMetadata,
    selectedWeightVector:
      modelMetadata.modelType === ModelTypes.Multiclass
        ? WeightVectors.AbsAvg
        : 0,
    showingDataSizeWarning: jointDataset.datasetRowCount > rowWarningSize,
    validationWarnings: validationCheck.errorStrings,
    weightVectorLabels,
    weightVectorOptions
  };
}
