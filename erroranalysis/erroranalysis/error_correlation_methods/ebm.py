# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the error correlation computation using an EBM."""

try:
    from interpret.glassbox import (ExplainableBoostingClassifier,
                                    ExplainableBoostingRegressor)
    ebm_installed = True
except ImportError:
    ebm_installed = False

from erroranalysis._internal.constants import ModelTask


def compute_ebm_global_importance(input_data, diff, model_task):
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
    if not ebm_installed:
        raise ImportError('EBM is not installed. Please install it by running '
                          '"pip install interpret"')
    if model_task == ModelTask.CLASSIFICATION:
        model = ExplainableBoostingClassifier(interactions=0)
    else:
        model = ExplainableBoostingRegressor(interactions=0)
    model.fit(input_data, diff)
    ebm_importances = model.term_importances()
    return ebm_importances.tolist()
