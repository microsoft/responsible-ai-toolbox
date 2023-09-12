# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum
from typing import Any, Dict, List, Optional, Union


class TaskType(str, Enum):
    CLASSIFICATION = 'classification'
    REGRESSION = 'regression'
    FORECASTING = 'forecasting'


class TabularDatasetMetadata:
    is_large_data_scenario: bool
    use_entire_test_data: bool
    feature_ranges: List[Dict[str, Any]]
    num_rows: int


class Dataset:
    task_type: TaskType
    predicted_y: List
    features: List[List[int]]
    feature_names: List[str]
    probability_y: List
    true_y: List
    class_names: List[str]
    categorical_features: List[str]
    target_column: str
    is_large_data_scenario: bool
    use_entire_test_data: bool
    feature_metadata: Optional[Dict[str, Any]]
    tabular_dataset_metadata: Optional[TabularDatasetMetadata]
    data_balance_measures: Dict[str, Any]
    images: Optional[List[str]]
    index: Optional[List[str]]
    object_detection_true_y: Optional[List]
    object_detection_predicted_y: Optional[List]
    imageDimensions: Optional[List[List[int]]]


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


class TextFeatureImportance:
    baseValues: List[float]
    localExplanations: List
    text: List[str]


class PrecomputedExplanations:
    localFeatureImportance: FeatureImportance
    globalFeatureImportance: FeatureImportance
    textFeatureImportance: List[TextFeatureImportance]
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


class VisionExplanationData:
    classNames: List[str]
    images: List[str]
    predictedY: List[str]
    trueY: List[str]


class ErrorAnalysisData:
    maxDepth: int
    numLeaves: int
    minChildSamples: int
    tree: list
    matrix: list
    tree_features: List[str]
    matrix_features: List[str]
    metric: str
    importances: list
    root_stats: Dict[str, Any]


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


class ComparisonTypes:
    LT = 'lt'  # less than
    LTE = 'lte'  # less than or equal to
    GT = 'gt'  # greater than
    GTE = 'gte'  # greater than or equal to
    EQ = 'eq'  # equal to
    NE = 'ne'  # not equal to
    IN = 'in'  # in the set
    NIN = 'nin'  # not in the set
    RG = 'rg'  # in the range
    NRG = 'nrg'  # not in the range


class CausalPolicyTreeInternal:
    leaf: False
    feature: str
    right_comparison: str
    comparison_value: Union[str, float, int, List[Union[str, float, int]]]
    left: Union['CausalPolicyTreeInternal', CausalPolicyTreeLeaf]
    right: Union['CausalPolicyTreeInternal', CausalPolicyTreeLeaf]


class CausalPolicy:
    treatment_feature: str
    control_treatment: str
    local_policies: List[Dict[str, Any]]
    policy_gains: CausalPolicyGains
    policy_tree: Union[CausalPolicyTreeInternal, CausalPolicyTreeLeaf]


class CausalConfig:
    treatment_features: List[str]


class CausalData:
    id: str
    version: str
    config: CausalConfig
    global_effects: List[CausalMetric]
    local_effects: List[List[CausalMetric]]
    policies: List[CausalPolicy]


class CounterfactualData:
    id: str
    cfs_list: List[List[List[Union[float, str]]]]
    feature_names: List[str]
    feature_names_including_target: List[str]
    summary_importance: List[float]
    local_importance: List[List[float]]
    model_type: str
    desired_class: str
    desired_range: List[float]
    test_data: List[List[Union[float, str]]]


class RAIInsightsData:
    dataset: Dataset
    modelExplanationData: List[ModelExplanationData]
    causalAnalysisData: List[CausalData]
    counterfactualData: List[CounterfactualData]
    errorAnalysisData: List[ErrorAnalysisData]
