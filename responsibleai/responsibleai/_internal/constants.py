# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines common private constants."""


class ManagerNames(object):
    """Provide the manager names."""

    CAUSAL = 'causal'
    COUNTERFACTUAL = 'counterfactual'
    DATA_BALANCE = 'data_balance'
    ERROR_ANALYSIS = 'error_analysis'
    EXPLAINER = 'explainer'


class Metadata(object):
    """Provide constants for metadata and saved files."""

    META_JSON = 'meta.json'
    MODEL = 'model'


class ListProperties(object):
    """Provide constants for listing manager properties."""

    MANAGER_TYPE = 'manager_type'


class ExplainerManagerKeys(object):
    """Provide constants for ExplainerManager key properties."""
    ID = 'id'
    IS_COMPUTED = 'is_computed'
    IS_ENGINEERED = 'is_engineered'
    IS_RAW = 'is_raw'
    METHOD = 'method'
    MODEL_TASK = 'model_task'
    MODEL_TYPE = 'model_type'


class ErrorAnalysisManagerKeys(object):
    """Provide constants for ErrorAnalysisManager key properties."""
    FILTER_FEATURES = 'filter_features'
    IS_COMPUTED = 'is_computed'
    MAX_DEPTH = 'max_depth'
    MIN_CHILD_SAMPLES = 'min_child_samples'
    NUM_LEAVES = 'num_leaves'
    REPORTS = 'reports'


class CounterfactualManagerKeys(object):
    """Provide constants for CounterfactualManager key properties."""
    COUNTERFACTUALS = 'counterfactuals'


class CausalManagerKeys(object):
    """Provide constants for CausalManager key properties."""
    CAUSAL_EFFECTS = 'causal_effects'
    GLOBAL_EFFECTS_COMPUTED = 'global_effects_computed'
    LOCAL_EFFECTS_COMPUTED = 'local_effects_computed'
    POLICIES_COMPUTED = 'policies_computed'


class DataBalanceManagerKeys(object):
    """Provide constants for DataBalanceManager key properties."""
    IS_ADDED = 'is_added'
    TASK_TYPE = 'task_type'
    COLS_OF_INTEREST = 'cols_of_interest'
    TARGET_COLUMN = 'target_column'
    CLASSES = 'classes'


class ExplanationKeys(object):

    EBM_GLOBAL_EXPLANATION_KEY = 'ebm_global'
    EXPLANATION_TYPE_KEY = 'explanation_type'
    GLOBAL_EXPLANATION_KEY = 'global_feature_importance'
    LOCAL_EXPLANATION_KEY = 'local_feature_importance'


class SerializationAttributes:
    """Constants for a serialized result."""

    # File structure
    RESULTS_DIRECTORY = 'results'

    # Metadata keys
    ID_KEY = 'id'
    VERSION_KEY = 'version'

    # Metadata filnames
    ID_FILENAME = 'id.json'
    VERSION_FILENAME = 'version.json'

    # Dashboard filenames
    DASHBOARD_FILENAME = 'dashboard.json'
