# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
import pandas as pd
from common_utils import (create_iris_data, create_cancer_data,
                          create_binary_classification_dataset,
                          create_models_classification)
from raitools import RAIAnalyzer, ModelTask

LABELS = "labels"


class TestRAIAnalyzer(object):

    def test_raianalyzer_iris(self):
        x_train, x_test, y_train, y_test, feature_names, classes = \
            create_iris_data()
        x_train = pd.DataFrame(x_train, columns=feature_names)
        x_test = pd.DataFrame(x_test, columns=feature_names)
        models = create_models_classification(x_train, y_train)
        x_train[LABELS] = y_train
        x_test[LABELS] = y_test

        for model in models:
            run_raianalyzer(model, x_train, x_test, LABELS, classes)

    def test_raianalyzer_cancer(self):
        x_train, x_test, y_train, y_test, feature_names, classes = \
            create_cancer_data()
        x_train = pd.DataFrame(x_train, columns=feature_names)
        x_test = pd.DataFrame(x_test, columns=feature_names)
        models = create_models_classification(x_train, y_train)
        x_train[LABELS] = y_train
        x_test[LABELS] = y_test

        for model in models:
            run_raianalyzer(model, x_train, x_test, LABELS, classes)

    def test_raianalyzer_binary(self):
        x_train, y_train, x_test, y_test, classes = \
            create_binary_classification_dataset()
        x_train = pd.DataFrame(x_train)
        x_test = pd.DataFrame(x_test)
        models = create_models_classification(x_train, y_train)
        x_train[LABELS] = y_train
        x_test[LABELS] = y_test

        for model in models:
            run_raianalyzer(model, x_train, x_test, LABELS, classes)


def run_raianalyzer(model, x_train, x_test, target_column, classes):
    error_analyzer = RAIAnalyzer(model, x_train, x_test, target_column,
                                 task_type=ModelTask.CLASSIFICATION)
    error_analyzer.explainer.add()
    # Validate calling add multiple times prints a warning
    with pytest.warns(UserWarning):
        error_analyzer.explainer.add()
    error_analyzer.explainer.compute()
    explanations = error_analyzer.explainer.get()
    assert isinstance(explanations, list)
    assert len(explanations) == 1
    explanation = explanations[0]
    assert len(explanation.local_importance_values) == len(classes)
    assert len(explanation.local_importance_values[0]) == len(x_test)
    num_cols = len(x_train.columns) - 1
    assert len(explanation.local_importance_values[0][0]) == num_cols
