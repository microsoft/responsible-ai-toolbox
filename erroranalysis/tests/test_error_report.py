# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest
import uuid


from erroranalysis._internal.error_report import ErrorReport
from common_utils import (
    create_boston_data, create_dataframe, create_iris_data,
    create_cancer_data, create_models_classification,
    create_models_regression)
from erroranalysis._internal.error_analyzer import ModelAnalyzer


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

    def test_error_report_cancer(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_cancer_data()

        models = create_models_classification(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features)

    def test_error_report_boston(self):
        X_train, X_test, y_train, y_test, feature_names = \
            create_boston_data()
        models = create_models_regression(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features)

    def test_error_report_boston_pandas(self):
        X_train, X_test, y_train, y_test, feature_names = \
            create_boston_data()
        X_train = create_dataframe(X_train, feature_names)
        X_test = create_dataframe(X_test, feature_names)
        models = create_models_regression(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features)


def is_valid_uuid(id):
    try:
        uuid.UUID(str(id))
        return True
    except ValueError:
        return False


def run_error_analyzer(model, X_test, y_test, feature_names,
                       categorical_features, expect_user_warnings=False):
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
    error_report1 = model_analyzer.create_error_report(filter_features=None,
                                                       max_depth=3,
                                                       num_leaves=None)
    error_report2 = model_analyzer.create_error_report()
    assert error_report1.id != error_report2.id

    # validate uuids in correct format
    assert is_valid_uuid(error_report1.id)
    assert is_valid_uuid(error_report2.id)

    json_str1 = error_report1.to_json()
    json_str2 = error_report2.to_json()
    assert json_str1 != json_str2

    # validate deserialized error report json
    error_report_deserialized = ErrorReport.from_json(json_str1)
    assert error_report_deserialized.id == error_report1.id
    assert error_report_deserialized.matrix == error_report1.matrix
    assert error_report_deserialized.tree == error_report1.tree

    # validate error report does not modify original dataset in ModelAnalyzer
    if isinstance(X_test, pd.DataFrame):
        assert X_test.equals(model_analyzer.dataset)
    else:
        assert np.array_equal(X_test, model_analyzer.dataset)
