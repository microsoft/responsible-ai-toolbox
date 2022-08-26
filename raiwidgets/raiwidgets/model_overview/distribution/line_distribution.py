# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for computing line distribution."""

import numpy as np
import pandas as pd
from typing import List

from raiwidgets.interfaces import LinePlotData


def _get_line_plot_distribution(data: np.ndarray) -> List[LinePlotData]:
    """Compute box plot distribution.

    :param data: Data.
    :type data: numpy.ndarray
    :return: Line plot distribution.
    :rtype: LinePlotData
    """
    line_plot_data_list = []
    (bins_out, bins) = pd.cut(
        data * 10,
        bins=[0, 10, 20, 30, 40, 50,
              60, 70, 80, 90, 100], retbins=True)

    for bin_out in bins_out.value_counts():
        line_plot_data = LinePlotData()
        line_plot_data.interval = bin_out.left.tolist()
        line_plot_data.count = bin_out.value
        line_plot_data_list.append(line_plot_data)

    return line_plot_data_list
