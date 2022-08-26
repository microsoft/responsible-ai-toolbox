# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for computing multi-class classification metrics."""

import numpy as np

from erroranalysis._internal.constants import multiclass_classification_metrics
from erroranalysis._internal.metrics import metric_to_func
from responsibleai.exceptions import UserConfigValidationException


def _get_multiclass_classification_metric(true_y: np.ndarray,
                                          predicted_y: np.ndarray,
                                          metric: str) -> float:
    """Compute multiclass classification metric.

    :param true_y: True labels.
    :type true_y: numpy.ndarray
    :param predicted_y: Predicted labels.
    :type predicted_y: numpy.ndarray
    :param metric: Metric to compute.
    :type metric: str
    :return: Multiclass classification metric value.
    :rtype: float
    """
    if metric not in multiclass_classification_metrics:
        raise UserConfigValidationException(
            "Metric {} is not a supported "
            "multiclass classification metric.".format(metric))

    return metric_to_func[metric](true_y, predicted_y)
