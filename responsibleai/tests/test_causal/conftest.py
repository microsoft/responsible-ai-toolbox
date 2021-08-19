# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import copy
import numpy as np
import pandas as pd
import pytest

from typing import List, Tuple

from ..common_utils import create_adult_income_dataset, create_boston_data


@pytest.fixture(scope='session')
def adult_data():
    X_train_df, X_test_df, y_train, y_test,\
        _, _, target_name, _ = create_adult_income_dataset()
    train_df = copy.deepcopy(X_train_df)
    test_df = copy.deepcopy(X_test_df)
    train_df[target_name] = y_train
    test_df[target_name] = y_test
    return train_df, test_df, target_name


@pytest.fixture(scope='session')
def boston_data() -> Tuple[pd.DataFrame, pd.DataFrame, str]:
    target_feature = 'TARGET'
    X_train, X_test, y_train, y_test, feature_names = create_boston_data()
    train_df = pd.DataFrame(X_train, columns=feature_names)
    train_df[target_feature] = y_train
    test_df = pd.DataFrame(X_test, columns=feature_names)
    test_df[target_feature] = y_test
    return train_df, test_df, target_feature


def _discretize_feature(
    feature: np.ndarray,
    category_map: List[Tuple[float, str]]
):
    """Map continous features onto discrete categories.
    - All feature values must be positive.
    - First lower bound must be zero.
    - Lower bounds must be strictly ascending.
    """
    cat_feat = np.zeros(feature.shape[0]).astype(str)
    for lower_bound, category in category_map:
        cat_feat[feature >= lower_bound] = category
    return cat_feat


@pytest.fixture(scope='session')
def boston_data_categorical(boston_data):
    train_df, test_df, target_feature = boston_data
    train_df = copy.deepcopy(train_df)
    test_df = copy.deepcopy(test_df)

    for df in [train_df, test_df]:
        cat_map = [(0, 'newest'), (40, 'newer'), (65, 'older'), (90, 'oldest')]
        df['AGE_CAT'] = _discretize_feature(df['AGE'], cat_map)
        cat_map = [(0, 'small'), (5, 'large')]
        df['RM_CAT'] = _discretize_feature(df['RM'], cat_map)
        cat_map = [(0, 'residential'), (10, 'mixed'), (18, 'commercial')]
        df['INDUS_CAT'] = _discretize_feature(df['INDUS'], cat_map)
        cat_map = [(0, 'no crime'), (5, 'low crime'),
                   (10, 'medium crime'), (20, 'high crime')]
        df['CRIM_CAT'] = _discretize_feature(df['CRIM'], cat_map)

    return train_df, test_df, target_feature


@pytest.fixture(scope='session')
def parks_data() -> Tuple[pd.DataFrame, pd.DataFrame, str]:
    feature_names = ['state', 'population', 'attraction', 'area']
    train_df = pd.DataFrame([
        ['massachusetts', 3129, 'trees', 11],
        ['utah', 41891, 'rocks', 51],
        ['california', 193912, 'trees', 62],
        ['california', 123901, 'trees', 25],
        ['utah', 39012, 'rocks', 34],
        ['colorado', 30102, 'rocks', 40],
        ['massachusetts', 4222, 'trees', 15],
        ['colorado', 20342, 'rocks', 42],
        ['arizona', 3201, 'rocks', 90],
        ['massachusetts', 3129, 'trees', 11],
        ['utah', 41891, 'rocks', 51],
        ['california', 193912, 'trees', 62],
        ['california', 123901, 'trees', 25],
        ['utah', 39012, 'rocks', 34],
        ['colorado', 30102, 'rocks', 40],
        ['massachusetts', 4222, 'trees', 15],
        ['colorado', 20342, 'rocks', 42],
        ['arizona', 3201, 'rocks', 90],
    ], columns=feature_names)

    test_df = pd.DataFrame([
        ['california', 323412, 'trees', 102],
        ['utah', 5103, 'rocks', 23],
        ['colorado', 4312, 'rocks', 19],
        ['california', 203912, 'trees', 202],
        ['utah', 5102, 'rocks', 21],
        ['colorado', 8120, 'rocks', 31],
    ], columns=feature_names)

    target_feature = 'area'
    return train_df, test_df, target_feature
