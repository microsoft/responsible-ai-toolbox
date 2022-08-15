# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for processing categorical features and their values."""
from typing import Dict, List, Tuple

import numpy
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OrdinalEncoder


def process_categoricals(all_feature_names: List[str],
                         categorical_features: List[str],
                         dataset: pd.DataFrame) -> \
        Tuple[List[List[str]], List[int], Dict[int, str], numpy.ndarray]:
    """Process categorical features to return the categories, indices
     and encoded values.

    :param all_feature_names: The list of all feature names.
    :type all_feature_names: list[str]
    :param categorical_features: The list of categorical features.
    :type categorical_features: list[str]
    :param dataset: The dataset.
    :type dataset: pd.DataFrame
    :return: The list of unique categories,
        the list of indices of categorical features,
        the dictionary of indices and categorical values
        and the encoded data.
    :rtype: (list[list[str]], list[int], dict[int, str], numpy.ndarray)
    """
    categories = []
    categorical_indexes = []
    category_dictionary = {}
    string_ind_data = numpy.array([])

    if categorical_features:
        categorical_indexes = [all_feature_names.index(feature)
                               for feature in categorical_features]
        ordinal_enc = OrdinalEncoder()
        ct = ColumnTransformer([('ord', ordinal_enc,
                                 categorical_indexes)],
                               remainder='drop')
        string_ind_data = ct.fit_transform(dataset)
        transformer_categories = ct.transformers_[0][1].categories_
        for category_arr, category_index in zip(transformer_categories,
                                                categorical_indexes):
            category_values = category_arr.tolist()
            categories.append(category_values)
            category_dictionary[category_index] = category_values

    return categories, categorical_indexes, category_dictionary,\
        string_ind_data
