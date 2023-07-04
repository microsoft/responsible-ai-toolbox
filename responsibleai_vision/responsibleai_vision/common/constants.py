# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum


class ModelTask(str, Enum):
    """Provide model task constants.

    Can be 'image_classification', 'object_detection' or 'unknown'.
    """

    IMAGE_CLASSIFICATION = 'image_classification'
    MULTILABEL_IMAGE_CLASSIFICATION = 'multilabel_image_classification'
    OBJECT_DETECTION = 'object_detection'
    UNKNOWN = 'unknown'


class ImageColumns(str, Enum):
    """Provide constants related to the input image dataframe columns.

    Can be 'image_url', 'image' or 'label'.
    """

    IMAGE_URL = 'image_url'
    IMAGE = 'image'
    LABEL = 'label'
    IMAGE_DETAILS = 'image_details'


class ExplainabilityLiterals:
    """Parameters for explainability method names."""

    MODEL_EXPLAINABILITY = 'model_explainability'
    XAI_PARAMETERS = 'xai_parameters'
    XAI_ALGORITHM = 'xai_algorithm'
    SHAP_METHOD_NAME = 'shap'
    XRAI_METHOD_NAME = 'xrai'
    INTEGRATEDGRADIENTS_METHOD_NAME = 'integrated_gradients'
    GUIDEDGRADCAM_METHOD_NAME = 'guided_gradcam'
    GUIDEDBACKPROP_METHOD_NAME = 'guided_backprop'
    CONFIDENCE_SCORE_THRESHOLD_MULTILABEL = (
        'confidence_score_threshold_multilabel'
    )
    N_STEPS = "n_steps"
    APPROXIMATION_METHOD = "approximation_method"
    XRAI_FAST = "xrai_fast"
    XAI_ARGS_GROUP = [
        XAI_ALGORITHM,
        N_STEPS,
        APPROXIMATION_METHOD,
        XRAI_FAST,
        CONFIDENCE_SCORE_THRESHOLD_MULTILABEL,
    ]
    SHAP = 'shap'


class ExplainabilityDefaults:
    """DEFAULT values for explainability parameters."""

    MODEL_EXPLAINABILITY = False
    XAI_ALGORITHM = ExplainabilityLiterals.GUIDEDGRADCAM_METHOD_NAME
    OUTPUT_VISUALIZATIONS = True
    OUTPUT_ATTRIBUTIONS = False
    CONFIDENCE_SCORE_THRESHOLD_MULTILABEL = 0.5
    DEFAULT_MAX_EVALS = 100
    DEFAULT_MASK_RES = 4
    DEFAULT_NUM_MASKS = 50


class XAIPredictionLiterals:
    """Strings that will be keys in the output json during prediction."""

    VISUALIZATIONS_KEY_NAME = 'visualizations'
    ATTRIBUTIONS_KEY_NAME = 'attributions'


class MLFlowSchemaLiterals:
    """MLFlow model signature related schema"""

    INPUT_IMAGE_KEY = 'image_base64'
    INPUT_COLUMN_IMAGE = 'image'
    INPUT_IMAGE_SIZE = 'image_size'


class CommonTags:
    """Common constants"""

    IMAGE_DECODE_UTF_FORMAT = 'utf-8'


class AutoMLImagesModelIdentifier:
    """AutoML model object types"""

    AUTOML_IMAGE_CLASSIFICATION_MODEL = (
        "WrappedMlflowAutomlImagesClassificationModel'>"
    )

    AUTOML_OBJECT_DETECTION_MODEL = (
        "WrappedMlflowAutomlObjectDetectionModel'>"
    )
