# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the error correlation computation using LightGBM with TreeShap."""

import numpy as np
import shap
from lightgbm import LGBMClassifier, LGBMRegressor

from erroranalysis._internal.constants import ModelTask


def compute_gbm_global_importance(input_data, diff, model_task,
                                  categorical_indexes):
    """Compute global importance score for EBM between the features and error.
    :param input_data: The input data to compute the EBM global importance
        score on.
    :type input_data: numpy.ndarray
    :param diff: The difference between the label and prediction
        columns.
    :type diff: numpy.ndarray
    :param model_task: The model task.
    :type model_task: str
    :return: The computed EBM global importance score between the features and
        error.
    :rtype: list[float]
    """
    is_classification = model_task == ModelTask.CLASSIFICATION
    if is_classification:
        model = LGBMClassifier()
    else:
        model = LGBMRegressor()
    model.fit(input_data, diff, categorical_feature=categorical_indexes)
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(input_data)
    shap_mean_abs = np.abs(shap_values).mean(axis=0)
    if is_classification:
        shap_mean_abs = shap_mean_abs.mean(axis=0)
    return shap_mean_abs.tolist()
