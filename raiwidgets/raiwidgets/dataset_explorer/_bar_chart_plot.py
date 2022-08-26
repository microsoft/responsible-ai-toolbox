# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for computing bar charts."""
from typing import List

import pandas as pd

from raiwidgets.interfaces import BarChartPlotData
from responsibleai.exceptions import UserConfigValidationException

MIN_BINS = 2
MAX_BINS = 40


def compute_bar_chart_plot(test_dataframe: pd.DataFrame,
                           categorical_features: List[str],
                           bar_chart_x_axis: str,
                           num_bins: int) -> BarChartPlotData:
    """Compute bar chart plot data."""
    if not isinstance(test_dataframe, pd.DataFrame):
        raise UserConfigValidationException(
            "test_dataframe must be a pandas DataFrame")

    if not isinstance(categorical_features, list):
        raise UserConfigValidationException(
            "categorical_features must be a list")

    if not isinstance(bar_chart_x_axis, str):
        raise UserConfigValidationException(
            "bar_chart_x_axis must be a string")

    if not isinstance(num_bins, int):
        raise UserConfigValidationException(
            "num_bins must be an integer")

    if bar_chart_x_axis not in test_dataframe.columns:
        raise UserConfigValidationException(
            f"{bar_chart_x_axis} is not a column in the test dataframe.")

    if num_bins < MIN_BINS or num_bins > MAX_BINS:
        raise UserConfigValidationException(
            "num_bins must be between {0} and {1}".format(
                MIN_BINS, MAX_BINS))

    if bar_chart_x_axis in categorical_features:
        histogram = test_dataframe[bar_chart_x_axis].value_counts().to_dict()
        bar_chart_plot_data = BarChartPlotData()
        bar_chart_plot_data.histogram = histogram
        return bar_chart_plot_data
    else:
        # TODO: Use pd.cut to create a histogram of the data.
        histogram = {}
        bar_chart_plot_data = BarChartPlotData()
        bar_chart_plot_data.histogram = histogram
        return bar_chart_plot_data
