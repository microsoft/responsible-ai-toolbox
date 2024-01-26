# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Compute AI-assisted metrics for generative text models."""

from pathlib import Path
import evaluate


def get_genai_metric(metric_name, **metric_kwargs):
    """Get the metric from the genai library.

    :param metric_name: The name of the metric.
    :type metric_name: str
    :param metric_kwargs: The keyword arguments to pass to the metric.
    :type metric_kwargs: dict
    :return: The metric.
    :rtype: float
    """
    curr_file_dir = Path(__file__).resolve().parent
    metric = evaluate.load(
        str(curr_file_dir.joinpath(f'scripts/{metric_name}.py')))
    return metric.compute(**metric_kwargs)
