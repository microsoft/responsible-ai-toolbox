# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum
from typing import Any, Dict, List, Tuple, Union


class TaskType(str, Enum):
    CLASSIFICATION = 'classification'
    REGRESSION = 'regression'


class Dataset:
    task_type: TaskType
    predicted_y: List
    features: List[List[int]]
    feature_names: List[str]
    probability_y: List
    true_y: List
    class_names: List[str]
    categorical_map: Dict[int, List[str]]
    target_column: str


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


class ModelExplanationData:
    modelClass: ModelClass
    explanationMethod: str
    precomputedExplanations: PrecomputedExplanations


class ErrorAnalysisData:
    maxDepth: int
    numLeaves: int


class CausalMetric:
    ci_lower: float
    ci_upper: float
    feature: str
    feature_value: str
    p_value: float
    point: float
    stderr: float
    zstat: float


class CausalPolicyGains:
    recommended_policy_gains: float
    treatment_gains: Dict[str, float]


class CausalPolicyTreeLeaf:
    leaf: True
    n_samples: int
    treatment: str


class CausalPolicyTreeInternal:
    leaf: False
    feature: str
    threshold: Union[float, str]  # TODO: Categorical features
    left: Union['CausalPolicyTreeInternal', CausalPolicyTreeLeaf]
    right: Union['CausalPolicyTreeInternal', CausalPolicyTreeLeaf]


class CausalPolicy:
    treatment_feature: str
    control_treatment: str
    local_policies: List[Dict[str, Any]]
    policy_gains: CausalPolicyGains
    policy_tree: Union[CausalPolicyTreeInternal, CausalPolicyTreeLeaf]


class CausalData:
    global_effects: List[CausalMetric]
    local_effects: List[List[CausalMetric]]
    policies: List[CausalPolicy]
    id: str
    treatment_features: [str]


class CounterfactualData:
    cfs_list: List[List[List[float]]]
    feature_names: List[str]
    feature_names_including_target: List[str]
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
