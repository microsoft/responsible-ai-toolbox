# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Constant strings."""


class ExplanationDashboardInterface(object):
    """Dictionary properties shared between \
        the python and javascript object."""
    CATEGORICAL_MAP = "categoricalMap"
    CLASS_NAMES = "classNames"
    CUSTOM_VISUALS = "customVis"
    EBM_EXPLANATION = "ebmGlobalExplanation"
    ERROR_ANALYSIS_DATA = 'errorAnalysisData'
    EXPLANATION_METHOD = 'explanation_method'
    FEATURE_NAMES = "featureNames"
    GLOBAL_EXPLANATION = "globalExplanation"
    HAS_MODEL = "has_model"
    IS_CLASSIFIER = "isClassifier"
    LOCAL_EXPLANATIONS = "localExplanations"
    LOCALE = "locale"
    MLI_DATASET_X_KEY = "dataset_x"
    MLI_DATASET_Y_KEY = "dataset_y"
    MLI_EBM_GLOBAL_EXPLANATION_KEY = "ebm_global"
    MLI_EXPLANATION_DATASET_KEY = "evaluation_dataset"
    MLI_EXPLANATION_TYPE_KEY = "explanation_type"
    MLI_GLOBAL_EXPLANATION_KEY = "global_feature_importance"
    MLI_LOCAL_EXPLANATION_KEY = "local_feature_importance"
    PREDICTED_Y = "predictedY"
    PROBABILITY_Y = "probabilityY"
    TRAINING_DATA = "trainingData"
    TRUE_Y = "trueY"
    LOCAL_URL = "localUrl"


class DatabricksInterfaceConstants(object):
    DISPLAY_HTML = "displayHTML"
    DISPLAY = "display"
    SPARK = "spark"


class WidgetRequestResponseConstants(object):
    """Strings used to pass messages between python and javascript."""
    ID = "id"
    DATA = "data"
    ERROR = "error"
    REQUEST = "request"
