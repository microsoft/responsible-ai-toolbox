// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  isTwoDimArray,
  IMultiClassLocalFeatureImportance,
  ISingleClassLocalFeatureImportance,
  JointDataset,
  Cohort,
  WeightVectors,
  ModelTypes,
  IExplanationModelMetadata,
  isThreeDimArray,
  ErrorCohort
} from "@responsible-ai/core-ui";
import {
  createInitialMatrixAreaState,
  createInitialMatrixFilterState,
  createInitialTreeViewState,
  ErrorAnalysisOptions
} from "@responsible-ai/error-analysis";
import { IGlobalExplanationProps } from "@responsible-ai/interpret";

import { localization } from "@responsible-ai/localization";
import { ModelMetadata } from "@responsible-ai/mlchartlib";
import { IModelAssessmentDashboardProps } from "../ModelAssessmentDashboardProps";
import { IModelAssessmentDashboardState } from "../ModelAssessmentDashboardState";
import { PredictionTabKeys, GlobalTabKeys } from "../ModelAssessmentEnums";
import memoize from "memoize-one";

// TODO which of these can go into core-ui utils?

function buildGlobalProperties(
  props: IModelAssessmentDashboardProps
): IGlobalExplanationProps {
  const result: IGlobalExplanationProps = {} as IGlobalExplanationProps;
  if (
    props.modelExplanationData.precomputedExplanations &&
    props.modelExplanationData.precomputedExplanations
      .globalFeatureImportance &&
    props.modelExplanationData.precomputedExplanations.globalFeatureImportance
      .scores
  ) {
    result.isGlobalImportanceDerivedFromLocal = false;
    if (
      isTwoDimArray(
        props.modelExplanationData.precomputedExplanations
          .globalFeatureImportance.scores
      )
    ) {
      result.globalImportance = props.modelExplanationData
        .precomputedExplanations.globalFeatureImportance.scores as number[][];
      result.globalImportanceIntercept = props.modelExplanationData
        .precomputedExplanations.globalFeatureImportance.intercept as number[];
    } else {
      result.globalImportance = (props.modelExplanationData
        .precomputedExplanations.globalFeatureImportance
        .scores as number[]).map((value) => [value]);
      result.globalImportanceIntercept = [
        props.modelExplanationData.precomputedExplanations
          .globalFeatureImportance.intercept as number
      ];
    }
  }
  return result;
}

const getClassLength: (
  props: IModelAssessmentDashboardProps
) => number = memoize((props: IModelAssessmentDashboardProps) => {
  if (
    props.modelExplanationData.precomputedExplanations &&
    props.modelExplanationData.precomputedExplanations.localFeatureImportance &&
    props.modelExplanationData.precomputedExplanations.localFeatureImportance
      .scores
  ) {
    const localImportances =
      props.modelExplanationData.precomputedExplanations.localFeatureImportance
        .scores;
    if (isThreeDimArray(localImportances)) {
      return localImportances.length;
    }
    // 2d is regression (could be a non-scikit convention binary, but that is not supported)
    return 1;
  }
  if (
    props.modelExplanationData.precomputedExplanations &&
    props.modelExplanationData.precomputedExplanations
      .globalFeatureImportance &&
    props.modelExplanationData.precomputedExplanations.globalFeatureImportance
      .scores
  ) {
    // determine if passed in values is 1D or 2D
    if (
      isTwoDimArray(
        props.modelExplanationData.precomputedExplanations
          .globalFeatureImportance.scores
      )
    ) {
      return (props.modelExplanationData.precomputedExplanations
        .globalFeatureImportance.scores as number[][]).length;
    }
  }
  if (
    props.modelExplanationData.probabilityY &&
    Array.isArray(props.modelExplanationData.probabilityY) &&
    Array.isArray(props.modelExplanationData.probabilityY[0]) &&
    props.modelExplanationData.probabilityY[0].length > 0
  ) {
    return props.modelExplanationData.probabilityY[0].length;
  }
  // default to regression case
  return 1;
});

export function buildInitialModelAssessmentContext(
  props: IModelAssessmentDashboardProps
): IModelAssessmentDashboardState {
  const modelMetadata = buildModelMetadata(props);

  let localExplanations:
    | IMultiClassLocalFeatureImportance
    | ISingleClassLocalFeatureImportance
    | undefined = undefined;
  if (
    props &&
    props.modelExplanationData.precomputedExplanations &&
    props.modelExplanationData.precomputedExplanations.localFeatureImportance &&
    props.modelExplanationData.precomputedExplanations.localFeatureImportance
      .scores
  ) {
    localExplanations =
      props.modelExplanationData.precomputedExplanations.localFeatureImportance;
  }
  const jointDataset = new JointDataset({
    dataset: props.dataset.features,
    localExplanations,
    metadata: modelMetadata,
    predictedProbabilities: props.modelExplanationData.probabilityY,
    predictedY: props.modelExplanationData.predictedY,
    trueY: props.dataset.trueY
  });
  const globalProps = buildGlobalProperties(props);
  // consider taking filters in as param arg for programmatic users
  const cohorts = [
    new ErrorCohort(
      new Cohort(
        localization.ErrorAnalysis.Cohort.defaultLabel,
        jointDataset,
        []
      ),
      jointDataset
    )
  ];
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
    activeGlobalTab: GlobalTabKeys.DataExplorerTab,
    baseCohort: cohorts[0],
    cohorts,
    customPoints: [],
    dataChartConfig: undefined,
    dependenceProps: undefined,
    editedCohort: cohorts[0],
    errorAnalysisOption: ErrorAnalysisOptions.TreeMap,
    globalImportance: globalProps.globalImportance,
    globalImportanceIntercept: globalProps.globalImportanceIntercept,
    importances: [],
    isGlobalImportanceDerivedFromLocal:
      globalProps.isGlobalImportanceDerivedFromLocal,
    jointDataset,
    mapShiftErrorAnalysisOption: ErrorAnalysisOptions.TreeMap,
    matrixAreaState: createInitialMatrixAreaState(),
    matrixFilterState: createInitialMatrixFilterState(),
    modelChartConfig: undefined,
    modelMetadata,
    openCohortListPanel: false,
    openEditCohort: false,
    openInfoPanel: false,
    openMapShift: false,
    openSaveCohort: false,
    openShiftCohort: false,
    openWhatIf: false,
    predictionTab: PredictionTabKeys.CorrectPredictionTab,
    selectedCohort: cohorts[0],
    selectedFeatures: props.dataset.featureNames,
    selectedWeightVector:
      modelMetadata.modelType === ModelTypes.Multiclass
        ? WeightVectors.AbsAvg
        : 0,
    selectedWhatIfIndex: undefined,
    sortVector: undefined,
    treeViewState: createInitialTreeViewState(),
    weightVectorLabels,
    weightVectorOptions,
    whatIfChartConfig: undefined
  };
}

function buildModelMetadata(
  props: IModelAssessmentDashboardProps
): IExplanationModelMetadata {
  const modelType = getModelType(props);
  let featureNames = props.dataset.featureNames;
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
    if (props.dataset.features && props.dataset.features[0] !== undefined) {
      featureLength = props.dataset.features[0].length;
    } else if (
      props.modelExplanationData.precomputedExplanations &&
      props.modelExplanationData.precomputedExplanations.globalFeatureImportance
    ) {
      featureLength =
        props.modelExplanationData.precomputedExplanations
          .globalFeatureImportance.scores.length;
    } else if (
      props.modelExplanationData.precomputedExplanations &&
      props.modelExplanationData.precomputedExplanations.localFeatureImportance
    ) {
      const localImportances =
        props.modelExplanationData.precomputedExplanations
          .localFeatureImportance.scores;
      if (isThreeDimArray(localImportances)) {
        featureLength = (props.modelExplanationData.precomputedExplanations
          .localFeatureImportance.scores[0][0] as number[]).length;
      } else {
        featureLength = (props.modelExplanationData.precomputedExplanations
          .localFeatureImportance.scores[0] as number[]).length;
      }
    } else if (
      props.modelExplanationData.precomputedExplanations &&
      props.modelExplanationData.precomputedExplanations.ebmGlobalExplanation
    ) {
      featureLength =
        props.modelExplanationData.precomputedExplanations.ebmGlobalExplanation
          .feature_list.length;
    }
    featureNames = buildIndexedNames(
      featureLength,
      localization.ErrorAnalysis.defaultFeatureNames
    );
    featureNamesAbridged = featureNames;
  }
  let classNames = props.dataset.classNames;
  const classLength = getClassLength(props);
  if (!classNames || classNames.length !== classLength) {
    classNames = buildIndexedNames(
      classLength,
      localization.ErrorAnalysis.defaultClassNames
    );
  }
  const featureIsCategorical = ModelMetadata.buildIsCategorical(
    featureNames.length,
    props.dataset.features,
    props.dataset.categoricalMap
  );
  const featureRanges =
    ModelMetadata.buildFeatureRanges(
      props.dataset.features,
      featureIsCategorical,
      props.dataset.categoricalMap
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

function buildIndexedNames(length: number, baseString: string): string[] {
  return [...new Array(length).keys()].map(
    (i) => localization.formatString(baseString, i.toString()) as string
  );
}

function getModelType(props: IModelAssessmentDashboardProps): ModelTypes {
  // If Python provides a hint, use it!
  if (props.modelExplanationData.method === "regressor") {
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
