# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
from tempfile import TemporaryDirectory
from common_utils import (create_iris_data, create_cancer_data,
                          create_binary_classification_dataset,
                          create_models_classification)
from raitools import RAIAnalyzer, ModelTask
from raitools._internal.constants import ManagerNames, ListProperties

LABELS = "labels"
LIGHTGBM_METHOD = 'mimic.lightgbm'


class TestRAIAnalyzer(object):

    def test_rai_analyzer_iris(self):
        x_train, x_test, y_train, y_test, feature_names, classes = \
            create_iris_data()
        x_train = pd.DataFrame(x_train, columns=feature_names)
        x_test = pd.DataFrame(x_test, columns=feature_names)
        models = create_models_classification(x_train, y_train)
        x_train[LABELS] = y_train
        x_test[LABELS] = y_test

        for model in models:
            run_rai_analyzer(model, x_train, x_test, LABELS, classes)

    def test_rai_analyzer_cancer(self):
        x_train, x_test, y_train, y_test, feature_names, classes = \
            create_cancer_data()
        x_train = pd.DataFrame(x_train, columns=feature_names)
        x_test = pd.DataFrame(x_test, columns=feature_names)
        models = create_models_classification(x_train, y_train)
        x_train[LABELS] = y_train
        x_test[LABELS] = y_test

        for model in models:
            run_rai_analyzer(model, x_train, x_test, LABELS, classes)

    def test_rai_analyzer_binary(self):
        x_train, y_train, x_test, y_test, classes = \
            create_binary_classification_dataset()
        x_train = pd.DataFrame(x_train)
        x_test = pd.DataFrame(x_test)
        models = create_models_classification(x_train, y_train)
        x_train[LABELS] = y_train
        x_test[LABELS] = y_test

        for model in models:
            run_rai_analyzer(model, x_train, x_test, LABELS, classes)


def run_rai_analyzer(model, x_train, x_test, target_column, classes):
    task_type = ModelTask.CLASSIFICATION
    rai_analyzer = RAIAnalyzer(model, x_train, x_test, target_column,
                               task_type=task_type)
    rai_analyzer.explainer.add()
    # Validate calling add multiple times prints a warning
    with pytest.warns(UserWarning):
        rai_analyzer.explainer.add()
    rai_analyzer.explainer.compute()
    validate_rai_analyzer(rai_analyzer, x_train, x_test, target_column,
                          task_type)
    validate_explainer(rai_analyzer, x_train, x_test, classes)
    with TemporaryDirectory() as tempdir:
        path = Path(tempdir) / 'explanation'
        # save the rai_analyzer
        rai_analyzer.save(path)
        # load the rai_analyzer
        rai_analyzer = RAIAnalyzer.load(path)
        rai_analyzer.explainer.compute()
        validate_rai_analyzer(rai_analyzer, x_train, x_test, target_column,
                              task_type)
        validate_explainer(rai_analyzer, x_train, x_test, classes)


def validate_rai_analyzer(rai_analyzer, x_train, x_test, target_column,
                          task_type):
    pd.testing.assert_frame_equal(rai_analyzer.train, x_train)
    pd.testing.assert_frame_equal(rai_analyzer.test, x_test)
    assert rai_analyzer.target_column == target_column
    assert rai_analyzer.task_type == task_type
    np.testing.assert_array_equal(rai_analyzer._classes,
                                  x_train[target_column].unique())


def validate_explainer(rai_analyzer, x_train, x_test, classes):
    explanations = rai_analyzer.explainer.get()
    assert isinstance(explanations, list)
    assert len(explanations) == 1
    explanation = explanations[0]
    assert len(explanation.local_importance_values) == len(classes)
    assert len(explanation.local_importance_values[0]) == len(x_test)
    num_cols = len(x_train.columns) - 1
    assert len(explanation.local_importance_values[0][0]) == num_cols
    properties = rai_analyzer.explainer.list()
    assert properties[ListProperties.MANAGER_TYPE] == ManagerNames.EXPLAINER
    assert 'id' in properties
    assert properties['method'] == LIGHTGBM_METHOD
    assert properties['model_task'] == ModelTask.CLASSIFICATION
    assert properties['model_type'] is None
    assert properties['is_raw'] is False
    assert properties['is_engineered'] is False
