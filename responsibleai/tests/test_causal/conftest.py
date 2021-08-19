import copy
import pandas as pd
import pytest

from typing import Tuple

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


@pytest.fixture(scope='session')
def boston_data_categorical(boston_data):
    train_df, test_df, target_feature = boston_data
    train_df = copy.deepcopy(train_df)
    test_df = copy.deepcopy(test_df)

    for df in [train_df, test_df]:
        cat_feat = df['AGE'].copy()
        cat_feat[cat_feat >= 90] = -1
        cat_feat[cat_feat >= 65] = -2
        cat_feat[cat_feat >= 40] = -3
        cat_feat[cat_feat >= 0] = -4
        cat_feat = cat_feat.astype(str)
        cat_feat[cat_feat == '-1.0'] = 'oldest'
        cat_feat[cat_feat == '-2.0'] = 'older'
        cat_feat[cat_feat == '-3.0'] = 'newer'
        cat_feat[cat_feat == '-4.0'] = 'newest'
        df['AGE_CAT'] = cat_feat

    for df in [train_df, test_df]:
        cat_feat = df['RM'].copy()
        cat_feat[cat_feat >= 5] = -1
        cat_feat[cat_feat >= 0] = -2
        cat_feat = cat_feat.astype(str)
        cat_feat[cat_feat == '-1.0'] = 'large'
        cat_feat[cat_feat == '-2.0'] = 'small'
        df['RM_CAT'] = cat_feat

    for df in [train_df, test_df]:
        cat_feat = df['INDUS'].copy()
        cat_feat[cat_feat >= 18] = -1
        cat_feat[cat_feat >= 10] = -2
        cat_feat[cat_feat >= 0] = -3
        cat_feat = cat_feat.astype(str)
        cat_feat[cat_feat == '-1.0'] = 'commercial'
        cat_feat[cat_feat == '-2.0'] = 'mixed'
        cat_feat[cat_feat == '-3.0'] = 'residential'
        df['INDUS_CAT'] = cat_feat

    for df in [train_df, test_df]:
        cat_feat = df['CRIM'].copy()
        cat_feat[cat_feat >= 60] = -1
        cat_feat[cat_feat >= 40] = -2
        cat_feat[cat_feat >= 20] = -3
        cat_feat[cat_feat >= 0] = -4
        cat_feat = cat_feat.astype(str)
        cat_feat[cat_feat == '-1.0'] = 'high crime'
        cat_feat[cat_feat == '-2.0'] = 'some crime'
        cat_feat[cat_feat == '-3.0'] = 'low cr'
        cat_feat[cat_feat == '-4.0'] = 'no crime'
        df['CRIM_CAT'] = cat_feat

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
