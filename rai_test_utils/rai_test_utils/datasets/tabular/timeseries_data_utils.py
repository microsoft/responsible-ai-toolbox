# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd


def create_timeseries_data(sample_cnt_per_grain,
                           time_column_name,
                           target_column_name,
                           grains_dict=None,
                           freq='D'):
    """Create a timeseries dataset.

    param sample_cnt_per_grain: Number of samples per grain.
    type sample_cnt_per_grain: int
    param time_column_name: Name of the time column.
    type time_column_name: str
    param target_column_name: Name of the target column.
    type target_column_name: str
    param grains_dict: Dictionary of grains.
    type grains_dict: dict
    param freq: Frequency of the time series.
    type freq: str
    return: Tuple of X, y
    rtype: Tuple of pandas.DataFrame, numpy.ndarray
    """
    data = []
    if grains_dict is None:
        grains_dict = {}
    for grain_comb in _get_all_combinations(grains_dict):
        row_data = {
            time_column_name: pd.date_range(start='2000-01-01',
                                            periods=sample_cnt_per_grain,
                                            freq=freq),
            target_column_name: np.sin(
                np.arange(sample_cnt_per_grain)).astype(float),
            'universal_answer': np.repeat(42, sample_cnt_per_grain),
            'orderdate': pd.date_range(
                '1992-08-01', periods=sample_cnt_per_grain, freq='D')
        }
        row_data.update(grain_comb)

        X = pd.DataFrame(row_data)
        data.append(X)

    X = pd.concat(data).set_index(
        [time_column_name] + list(grains_dict.keys())
    )
    y = X.pop(target_column_name).values
    return X, y


def _get_all_combinations(input_dict):
    input_list = [(k, v) for k, v in input_dict.items()]
    len_list = [len(kv[1]) for kv in input_list]

    input_idx = [0] * len(input_dict)
    if len(input_dict) == 0:
        return [{}]

    output = []

    done = False
    while True:
        new_combination = {
            input_list[i][0]: input_list[i][1][idx] for i, idx in enumerate(
                input_idx)
        }
        output.append(new_combination)

        input_idx[-1] += 1
        carry_check_pos = -1
        while True:
            if input_idx[carry_check_pos] == len_list[carry_check_pos]:
                if carry_check_pos == -len(input_dict):
                    done = True
                    break
                input_idx[carry_check_pos] = 0
                input_idx[carry_check_pos - 1] += 1
                carry_check_pos -= 1
            else:
                break

        if done:
            break

    return output
