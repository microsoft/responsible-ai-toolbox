# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import pandas as pd

from ..common_utils import create_boston_data

from responsibleai import ModelAnalysis, ModelTask


TARGET_FEATURE = 'TARGET'


class TestCausalManager:
    def test_causal_no_categoricals(self):
        X_train, X_test, y_train, y_test, feature_names = \
            create_boston_data()
        train_df = pd.DataFrame(X_train, columns=feature_names)
        train_df[TARGET_FEATURE] = y_train
        test_df = pd.DataFrame(X_test, columns=feature_names)
        test_df[TARGET_FEATURE] = y_test

        categoricals = None
        task = ModelTask.REGRESSION
        analysis = ModelAnalysis(
            None, train_df, test_df, TARGET_FEATURE, task,
            categorical_features=categoricals)

        treatment_features = ['ZN']
        analysis.causal.add(treatment_features=treatment_features)
        analysis.causal.compute()
        results = analysis.causal.get()

        assert len(results) == 1
        assert len(results[0]['policies']) == 1
        assert len(results[0]['treatment_features']) == 1
