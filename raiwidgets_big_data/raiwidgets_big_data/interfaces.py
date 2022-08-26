# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.


from typing import Any, Dict, List


class WidgetRequestResponseConstants(object):
    """Strings used to pass messages between python and javascript."""
    id = "id"
    data = "data"
    error = "error"
    request = "request"


class BarChartPlotData(object):
    """Interface for bar chart plot data."""
    histogram: Dict[str, int]


class ClusterData(object):
    """Interface for cluster data."""
    size: int
    x_center: Any
    y_center: Any


class BubbleChartPlotData(object):
    """Interface for bubble chart plot data."""
    clusters: List[ClusterData]


class BoxPlotData(object):
    """Interface for box plot plot data."""
    first_quartile: float
    third_quartile: float
    median: float
    maximum: float
    minimum: float
    outliers: List[float]


class LinePlotData(object):
    """Interface for line plot data."""
    interval: List[float]
    count: int
