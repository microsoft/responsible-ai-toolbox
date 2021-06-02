// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IMultiClassLocalFeatureImportance,
  ISingleClassLocalFeatureImportance,
  JointDataset,
  Cohort,
  WeightVectors,
  ModelTypes,
  IExplanationModelMetadata,
  isThreeDimArray,
  ErrorCohort,
  buildGlobalProperties,
  buildIndexedNames,
  getClassLength,
  getModelType
} from "@responsible-ai/core-ui";
import {
  createInitialMatrixAreaState,
  createInitialMatrixFilterState,
  createInitialTreeViewState,
  ErrorAnalysisOptions
} from "@responsible-ai/error-analysis";
import { localization } from "@responsible-ai/localization";
import { ModelMetadata } from "@responsible-ai/mlchartlib";

import { IModelAssessmentDashboardProps } from "../ModelAssessmentDashboardProps";
import { IModelAssessmentDashboardState } from "../ModelAssessmentDashboardState";
import { PredictionTabKeys, GlobalTabKeys } from "../ModelAssessmentEnums";

export function buildInitialModelAssessmentContext(
  props: IModelAssessmentDashboardProps
): IModelAssessmentDashboardState {
  const modelMetadata = buildModelMetadata(props);

  let localExplanations:
    | IMultiClassLocalFeatureImportance
    | ISingleClassLocalFeatureImportance
    | undefined = undefined;
  if (
    props.modelExplanationData?.[0]?.precomputedExplanations
      ?.localFeatureImportance?.scores
  ) {
    localExplanations =
      props.modelExplanationData[0].precomputedExplanations
        .localFeatureImportance;
  }
  const jointDataset = new JointDataset({
    dataset: props.dataset.features,
    localExplanations,
    metadata: modelMetadata,
    predictedProbabilities: props.dataset.probabilityY,
    predictedY: props.dataset.predictedY,
    trueY: props.dataset.trueY
  });
  const globalProps = buildGlobalProperties(
    props.modelExplanationData?.[0]?.precomputedExplanations
  );
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
    activeGlobalTabs: [
      {
        dataCount: jointDataset.datasetRowCount,
        key: GlobalTabKeys.ErrorAnalysisTab
      },
      {
        dataCount: jointDataset.datasetRowCount,
        key: GlobalTabKeys.ModelStatisticsTab
      },
      {
        dataCount: jointDataset.datasetRowCount,
        key: GlobalTabKeys.DataExplorerTab
      },
      {
        dataCount: jointDataset.datasetRowCount,
        key: GlobalTabKeys.GlobalExplanationTab
      },
      {
        dataCount: jointDataset.datasetRowCount,
        key: GlobalTabKeys.LocalExplanationTab
      },
      {
        dataCount: jointDataset.datasetRowCount,
        key: GlobalTabKeys.CausalAnalysisTab
      },
      {
        dataCount: jointDataset.datasetRowCount,
        key: GlobalTabKeys.CounterfactualsTab
      }
    ],
    baseCohort: cohorts[0],
    cohorts,
    customPoints: [],
    dataChartConfig: undefined,
    dependenceProps: undefined,
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
    whatIfChartConfig: undefined,
    createCohortVisible: false,
    shiftCohortVisible: false,
    saveCohortVisible: false
  };
}

function buildModelMetadata(
  props: IModelAssessmentDashboardProps
): IExplanationModelMetadata {
  const modelType = getModelType(
    props.modelExplanationData?.[0]?.method,
    props.modelExplanationData?.[0]?.precomputedExplanations,
    props.modelExplanationData?.[0]?.probabilityY
  );
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
      props.modelExplanationData?.[0]?.precomputedExplanations &&
      props.modelExplanationData?.[0]?.precomputedExplanations
        .globalFeatureImportance
    ) {
      featureLength =
        props.modelExplanationData?.[0]?.precomputedExplanations
          .globalFeatureImportance.scores.length;
    } else if (
      props.modelExplanationData?.[0]?.precomputedExplanations &&
      props.modelExplanationData?.[0]?.precomputedExplanations
        .localFeatureImportance
    ) {
      const localImportances =
        props.modelExplanationData?.[0]?.precomputedExplanations
          .localFeatureImportance.scores;
      if (isThreeDimArray(localImportances)) {
        featureLength = (props.modelExplanationData?.[0]
          ?.precomputedExplanations.localFeatureImportance
          .scores[0][0] as number[]).length;
      } else {
        featureLength = (props.modelExplanationData?.[0]
          ?.precomputedExplanations.localFeatureImportance
          .scores[0] as number[]).length;
      }
    } else if (
      props.modelExplanationData?.[0]?.precomputedExplanations &&
      props.modelExplanationData?.[0]?.precomputedExplanations
        .ebmGlobalExplanation
    ) {
      featureLength =
        props.modelExplanationData?.[0]?.precomputedExplanations
          .ebmGlobalExplanation.feature_list.length;
    }
    featureNames = buildIndexedNames(
      featureLength,
      localization.ErrorAnalysis.defaultFeatureNames
    );
    featureNamesAbridged = featureNames;
  }
  let classNames = props.dataset.classNames;
  const classLength = getClassLength(
    props.modelExplanationData?.[0]?.precomputedExplanations,
    props.modelExplanationData?.[0]?.probabilityY
  );
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
