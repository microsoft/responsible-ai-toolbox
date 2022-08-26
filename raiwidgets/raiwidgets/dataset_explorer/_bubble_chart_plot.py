# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for computing bubble charts."""
from collections import Counter
from typing import List

import pandas as pd
from sklearn.cluster import KMeans

from raiwidgets.interfaces import BubbleChartPlotData, ClusterData
from responsibleai.exceptions import UserConfigValidationException

MIN_SAMPLES = 1000


def compute_bubble_chart_plot(test_dataframe: pd.DataFrame,
                              categorical_features: List[str],
                              bubble_chart_x_axis: str,
                              bubble_chart_y_axis: str) -> BubbleChartPlotData:
    """Compute bubble chart plot data."""
    if not isinstance(test_dataframe, pd.DataFrame):
        raise UserConfigValidationException(
            "test_dataframe must be a pandas DataFrame")

    if not isinstance(categorical_features, list):
        raise UserConfigValidationException(
            "categorical_features must be a list")

    if not isinstance(bubble_chart_x_axis, str):
        raise UserConfigValidationException(
            "bar_chart_x_axis must be a string")

    if not isinstance(bubble_chart_y_axis, str):
        raise UserConfigValidationException(
            "bar_chart_y_axis must be a string")

    if bubble_chart_x_axis not in test_dataframe.columns:
        raise UserConfigValidationException(
            f"{bubble_chart_x_axis} is not a column in the test dataframe.")

    if bubble_chart_y_axis not in test_dataframe.columns:
        raise UserConfigValidationException(
            f"{bubble_chart_y_axis} is not a column in the test dataframe.")

    if len(test_dataframe) <= MIN_SAMPLES:
        raise UserConfigValidationException(
            f"The test dataframe must contain more than {MIN_SAMPLES} rows.")

    bubble_chart_plot_data = BubbleChartPlotData()
    bubble_chart_plot_data.clusters = []

    if bubble_chart_x_axis not in categorical_features and \
            bubble_chart_y_axis not in categorical_features:
        X = test_dataframe[[
            bubble_chart_x_axis, bubble_chart_y_axis]].values
        n_clusters = (len(test_dataframe) // MIN_SAMPLES) + 1

        kmeans = KMeans(n_clusters=n_clusters, random_state=0).fit(X)

        label_size_dict = dict(Counter(kmeans.labels_))
        cluster_center_list = kmeans.cluster_centers_.tolist()

        for label in label_size_dict:
            cluster_data = ClusterData()
            cluster_data.size = label_size_dict[label]
            cluster_data.x_center = cluster_center_list[label][0]
            cluster_data.y_center = cluster_center_list[label][1]
            bubble_chart_plot_data.clusters.append(cluster_data)
    elif bubble_chart_x_axis not in categorical_features:
        # TODO: create clusters by categories in bubble_chart_y_axis
        #       and find the mean of values in bubble_chart_x_axis
        pass
    elif bubble_chart_y_axis not in categorical_features:
        # TODO: create clusters by categories in bubble_chart_x_axis
        #       and find the mean of values in bubble_chart_y_axis
        pass
    else:
        # TODO: create clusters by number of categories in
        #       bubble_chart_x_axis multiplied by number of
        #       categories in bubble_chart_y_axis
        pass
    return bubble_chart_plot_data
