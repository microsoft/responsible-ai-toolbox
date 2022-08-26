# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for computing box plot distribution."""

import numpy as np

from raiwidgets.interfaces import BoxPlotData


def _get_box_plot_distribution(data: np.ndarray) -> BoxPlotData:
    """Compute box plot distribution.

    :param data: Data.
    :type data: numpy.ndarray
    :return: Box plot distribution.
    :rtype: BoxPlotPlotData
    """
    box_plot_data = BoxPlotData()

    percentile_values = np.percentile(data, [25, 50, 75])
    interquartile_range = percentile_values[2] - percentile_values[0]
    lower_fence = percentile_values[0] - 1.5 * interquartile_range
    upper_fence = percentile_values[2] + 1.5 * interquartile_range

    box_plot_data.q1 = percentile_values[0]
    box_plot_data.median = percentile_values[1]
    box_plot_data.q3 = percentile_values[2]

    non_outliers = data[np.logical_and(
        data >= lower_fence, data <= upper_fence)]
    box_plot_data.minimum = np.min(non_outliers)
    box_plot_data.maximum = np.max(non_outliers)

    outliers = data[np.logical_or(data < lower_fence, data > upper_fence)]
    box_plot_data.outliers = outliers.tolist()

    return box_plot_data
