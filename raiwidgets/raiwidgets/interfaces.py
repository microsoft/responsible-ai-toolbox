# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum
from typing import List


class Dataset(object):
    predictedY: List
    features: List[List[int]]
    featureNames: List[str]
    probabilityY: List
    trueY: List
    classNames: List[str]


class BoundedCoordinates(object):
    type: str
    names: List
    scores: List
    scores_range: List
    upper_bounds: List
    lower_bounds: List


class EBMGlobalExplanation (object):
    feature_list: List[BoundedCoordinates]


class FeatureImportance(object):
    scores: List
    intercept: float
    featureNames: List[str]


class PrecomputedExplanations(object):
    localFeatureImportance: FeatureImportance
    globalFeatureImportance: FeatureImportance
    ebmGlobalExplanation: EBMGlobalExplanation
    customVis: str


class ModelClass(str, Enum):
    Tree = "Tree"
    EBM = "EBM"
    blackbox = "blackbox"


class ModelMethod(str, Enum):
    classifier = "classifier"
    regressor = "regressor"


class ModelExplanationData(object):
    modelClass: ModelClass
    method: ModelMethod
    predictedY: List
    probabilityY: List[List[float]]
    explanationMethod: str
    precomputedExplanations: PrecomputedExplanations


class ErrorAnalysisConfig(object):
    maxDepth: int
    numLeaves: int


class CausalMetric(object):
    ci_lower: float
    ci_upper: float
    feature: str
    p_value: float
    point: float
    stderr: float
    zstat: float


class CausalData(object):
    globalCausalEffects: List[CausalMetric]
    localCausalEffects: List[List[CausalMetric]]


class CounterfactualData(object):
    cfsList: List[List[List[float]]]
    featureNames: List[float]


class ModelAnalysisDashboardData(object):
    dataset: Dataset
    modelExplanationData: List[ModelExplanationData]
    causalAnalysisData: List[CausalData]
    counterfactualData: List[CounterfactualData]
    errorAnalysisConfig: List[ErrorAnalysisConfig]


class WidgetRequestResponseConstants(object):
    """Strings used to pass messages between python and javascript."""
    id = "id"
    data = "data"
    error = "error"
    request = "request"
