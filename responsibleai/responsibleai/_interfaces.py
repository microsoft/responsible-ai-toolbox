# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum
from typing import List, Tuple


class Dataset:
    predictedY: List
    features: List[List[int]]
    featureNames: List[str]
    probabilityY: List
    trueY: List
    classNames: List[str]


class BoundedCoordinates:
    type: str
    names: List
    scores: List
    scores_range: List
    upper_bounds: List
    lower_bounds: List


class EBMGlobalExplanation:
    feature_list: List[BoundedCoordinates]


class FeatureImportance:
    scores: List
    intercept: float
    featureNames: List[str]


class PrecomputedExplanations:
    localFeatureImportance: FeatureImportance
    globalFeatureImportance: FeatureImportance
    ebmGlobalExplanation: EBMGlobalExplanation
    customVis: str


class ModelClass(str, Enum):
    TREE = 'Tree'
    EBM = 'EBM'
    BLACKBOX = 'blackbox'


class ModelMethod(str, Enum):
    CLASSIFIER = 'classifier'
    REGRESSOR = 'regressor'


class ModelExplanationData:
    modelClass: ModelClass
    method: ModelMethod
    predictedY: List
    probabilityY: List[List[float]]
    explanationMethod: str
    precomputedExplanations: PrecomputedExplanations


class ErrorAnalysisData:
    maxDepth: int
    numLeaves: int


class CausalMetric:
    ci_lower: float
    ci_upper: float
    feature: str
    p_value: float
    point: float
    stderr: float
    zstat: float


class CausalData:
    global_effects: List[CausalMetric]
    local_effects: List[List[CausalMetric]]


class CounterfactualData:
    cfs_list: List[List[List[float]]]
    feature_names: List[str]
    summary_importance: List[float]
    local_importance: List[List[float]]
    model_type: str
    desired_class: str
    desired_range: List[Tuple[float]]


class ModelAnalysisData:
    dataset: Dataset
    modelExplanationData: List[ModelExplanationData]
    causalAnalysisData: List[CausalData]
    counterfactualData: List[CounterfactualData]
    errorAnalysisConfig: List[ErrorAnalysisData]
