// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IMultiClassLocalFeatureImportance,
  ISingleClassLocalFeatureImportance,
  JointDataset,
  Cohort,
  CohortSource,
  IExplanationModelMetadata,
  isThreeDimArray,
  ErrorCohort,
  buildGlobalProperties,
  buildIndexedNames,
  getClassLength,
  getModelTypeFromExplanation,
  getModelTypeFromTextExplanation,
  MetricCohortStats,
  DatasetTaskType,
  ModelTypes
} from "@responsible-ai/core-ui";
import { ErrorAnalysisOptions } from "@responsible-ai/error-analysis";
import { localization } from "@responsible-ai/localization";
import { ModelMetadata } from "@responsible-ai/mlchartlib";

import { getAvailableTabs } from "../AvailableTabs";
import { processPreBuiltCohort } from "../Cohort/ProcessPreBuiltCohort";
import { IModelAssessmentDashboardProps } from "../ModelAssessmentDashboardProps";
import {
  IModelAssessmentDashboardState,
  IModelAssessmentDashboardTab
} from "../ModelAssessmentDashboardState";
import { GlobalTabKeys } from "../ModelAssessmentEnums";

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
    featureMetaData: props.dataset.feature_metadata,
    localExplanations,
    metadata: modelMetadata,
    predictedProbabilities: props.dataset.probability_y,
    predictedY: props.dataset.predicted_y,
    trueY: props.dataset.true_y
  });
  const globalProps = buildGlobalProperties(
    props.modelExplanationData?.[0]?.precomputedExplanations
  );

  let metricStats: MetricCohortStats | undefined = undefined;
  if (props.errorAnalysisData?.[0]?.root_stats) {
    const rootStats = props.errorAnalysisData?.[0]?.root_stats;
    metricStats = new MetricCohortStats(
      rootStats.totalSize,
      rootStats.totalSize,
      rootStats.metricValue,
      rootStats.metricName,
      rootStats.errorCoverage
    );
  }
  const defaultErrorCohort = new ErrorCohort(
    new Cohort(
      localization.ErrorAnalysis.Cohort.defaultLabel,
      jointDataset,
      []
    ),
    jointDataset,
    0,
    CohortSource.None,
    false,
    metricStats
  );
  let errorCohortList: ErrorCohort[] = [defaultErrorCohort];
  const [preBuiltErrorCohortList] = processPreBuiltCohort(props, jointDataset);
  errorCohortList = errorCohortList.concat(preBuiltErrorCohortList);
  const cohorts = errorCohortList;

  // only include tabs for which we have the required data
  const activeGlobalTabs: IModelAssessmentDashboardTab[] = getAvailableTabs(
    props,
    false
  ).map((item) => {
    return {
      dataCount: jointDataset.datasetRowCount,
      key: item.key as GlobalTabKeys,
      name: item.text as string
    };
  });
  return {
    activeGlobalTabs,
    baseCohort: cohorts[0],
    cohorts,
    customPoints: [],
    dataChartConfig: undefined,
    dependenceProps: undefined,
    errorAnalysisOption: ErrorAnalysisOptions.TreeMap,
    globalImportance: globalProps.globalImportance,
    globalImportanceIntercept: globalProps.globalImportanceIntercept,
    isGlobalImportanceDerivedFromLocal:
      globalProps.isGlobalImportanceDerivedFromLocal,
    jointDataset,
    modelChartConfig: undefined,
    modelMetadata,
    onAddMessage: "",
    saveCohortVisible: false,
    selectedCohort: cohorts[0],
    selectedWhatIfIndex: undefined,
    sortVector: undefined
  };
}

function getModelTypeFromProps(
  props: IModelAssessmentDashboardProps,
  classNames: string[] | undefined
): ModelTypes {
  let modelType: ModelTypes = ModelTypes.Multiclass;
  if (props.dataset.task_type === DatasetTaskType.Regression) {
    modelType = ModelTypes.Regression;
  } else if (props.dataset.task_type === DatasetTaskType.Classification) {
    modelType = getModelTypeFromExplanation(
      props.modelExplanationData?.[0]?.precomputedExplanations,
      props.dataset.probability_y
    );
  }
  if (props.dataset.task_type === DatasetTaskType.ImageClassification) {
    if (classNames && classNames.length === 2) {
      modelType = ModelTypes.ImageBinary;
    } else {
      modelType = ModelTypes.ImageMulticlass;
    }
  } else if (props.dataset.task_type === DatasetTaskType.TextClassification) {
    if (classNames) {
      if (classNames.length === 2) {
        modelType = ModelTypes.TextBinary;
      } else {
        modelType = ModelTypes.TextMulticlass;
      }
    } else {
      getModelTypeFromTextExplanation(
        props.modelExplanationData?.[0]?.precomputedExplanations,
        props.dataset.probability_y
      );
    }
  }
  return modelType;
}

function buildModelMetadata(
  props: IModelAssessmentDashboardProps
): IExplanationModelMetadata {
  let classNames = props.dataset.class_names;
  const modelType = getModelTypeFromProps(props, classNames);
  let featureNames = props.dataset.feature_names;
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
        featureLength = (
          props.modelExplanationData?.[0]?.precomputedExplanations
            .localFeatureImportance.scores[0][0] as number[]
        ).length;
      } else {
        featureLength = (
          props.modelExplanationData?.[0]?.precomputedExplanations
            .localFeatureImportance.scores[0] as number[]
        ).length;
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
  if (modelType !== ModelTypes.ImageMulticlass) {
    const classLength = getClassLength(
      props.modelExplanationData?.[0]?.precomputedExplanations,
      props.dataset.probability_y
    );
    if (!classNames || classNames.length !== classLength) {
      classNames = buildIndexedNames(
        classLength,
        localization.ErrorAnalysis.defaultClassNames
      );
    }
  } else if (!classNames) {
    throw new Error(
      "Invalid input data for image classification, class names required."
    );
  }
  const featureIsCategorical = ModelMetadata.buildIsCategorical(
    featureNames.length,
    props.dataset.features
  ).map(
    (v, i) =>
      v ||
      props.dataset.categorical_features.includes(
        props.dataset.feature_names[i]
      )
  );
  const featureRanges =
    ModelMetadata.buildFeatureRanges(
      props.dataset.features,
      featureIsCategorical
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
