# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest

from erroranalysis._internal.error_analyzer import ModelAnalyzer
from erroranalysis._internal.error_report import ErrorReport
from rai_test_utils.datasets.tabular import (create_cancer_data,
                                             create_housing_data,
                                             create_iris_data,
                                             create_simple_titanic_data)
from rai_test_utils.models.model_utils import (create_models_classification,
                                               create_models_regression)
from rai_test_utils.models.sklearn import \
    create_complex_classification_pipeline
from rai_test_utils.utilities import is_valid_uuid


class TestErrorReport(object):

    @pytest.mark.parametrize('alter_feature_names', [True, False])
    def test_error_report_iris(self, alter_feature_names):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_data(append_special_characters=alter_feature_names)

        models = create_models_classification(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features,
                               expect_user_warnings=alter_feature_names)

    def test_error_report_iris_numpy_int64_features(self):
        X_train, X_test, y_train, y_test, _, _ = create_iris_data()
        # Test with numpy feature indexes instead of string feature names
        feature_names = range(0, X_train.shape[1])
        feature_names = [np.int64(i) for i in feature_names]
        models = create_models_classification(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features)

    def test_error_report_cancer(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_cancer_data()

        models = create_models_classification(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features)

    def test_error_report_housing(self):
        X_train, X_test, y_train, y_test, feature_names = \
            create_housing_data()
        models = create_models_regression(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features)

    @pytest.mark.parametrize('filter_features',
                             [None, [], ['MedInc', 'HouseAge']])
    def test_error_report_housing_pandas(self, filter_features):
        X_train, X_test, y_train, y_test, feature_names = \
            create_housing_data()
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)
        models = create_models_regression(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features,
                               filter_features=filter_features)

    def test_error_report_titanic(self):
        X_train, X_test, y_train, y_test, numeric, categorical = \
            create_simple_titanic_data()

        # Drop all numeric features
        X_train = X_train.drop(['pclass', 'age', 'fare'], axis=1)
        X_test = X_test.drop(['pclass', 'age', 'fare'], axis=1)

        clf = create_complex_classification_pipeline(
            X_train, y_train, [], ['embarked', 'sex'])

        # Pass the remaining categorical features
        run_error_analyzer(clf, X_test, y_test, ['embarked', 'sex'],
                           ['embarked', 'sex'],
                           filter_features=[])


def run_error_analyzer(model, X_test, y_test, feature_names,
                       categorical_features, expect_user_warnings=False,
                       filter_features=None):
    if expect_user_warnings and pd.__version__[0] == '0':
        with pytest.warns(UserWarning,
                          match='which has issues with pandas version'):
            model_analyzer = ModelAnalyzer(model, X_test, y_test,
                                           feature_names,
                                           categorical_features)
    else:
        model_analyzer = ModelAnalyzer(model, X_test, y_test,
                                       feature_names,
                                       categorical_features)
    report1 = model_analyzer.create_error_report(filter_features,
                                                 max_depth=3,
                                                 num_leaves=None,
                                                 compute_importances=True)
    report2 = model_analyzer.create_error_report()
    assert report1.id != report2.id

    # validate uuids in correct format
    assert is_valid_uuid(report1.id)
    assert is_valid_uuid(report2.id)

    json_str1 = report1.to_json()
    json_str2 = report2.to_json()
    assert json_str1 != json_str2

    # validate deserialized error report json
    ea_deserialized = ErrorReport.from_json(json_str1)
    assert ea_deserialized.id == report1.id
    assert ea_deserialized.matrix == report1.matrix
    assert ea_deserialized.tree == report1.tree
    assert ea_deserialized.tree_features == report1.tree_features
    assert ea_deserialized.matrix_features == report1.matrix_features
    assert ea_deserialized.importances == report1.importances
    assert ea_deserialized.root_stats == report1.root_stats

    if not filter_features:
        assert ea_deserialized.matrix is None
    else:
        assert ea_deserialized.matrix is not None

    # validate error report does not modify original dataset in ModelAnalyzer
    if isinstance(X_test, pd.DataFrame):
        assert X_test.equals(model_analyzer.dataset)
    else:
        assert np.array_equal(X_test, model_analyzer.dataset)
