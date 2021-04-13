# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
from tempfile import TemporaryDirectory
from common_utils import (create_iris_data, create_cancer_data,
                          create_binary_classification_dataset, create_models)
from raitools import RAIAnalyzer, ModelTask
from raitools.raianalyzer.constants import ManagerNames, ListProperties

LABELS = "labels"
LIGHTGBM_METHOD = 'mimic.lightgbm'


class TestRAIAnalyzer(object):

    def test_raianalyzer_iris(self):
        x_train, x_test, y_train, y_test, feature_names, classes = \
            create_iris_data()
        x_train = pd.DataFrame(x_train, columns=feature_names)
        x_test = pd.DataFrame(x_test, columns=feature_names)
        models = create_models(x_train, y_train)
        x_train[LABELS] = y_train
        x_test[LABELS] = y_test

        for model in models:
            run_raianalyzer(model, x_train, x_test, LABELS, classes)

    def test_raianalyzer_cancer(self):
        x_train, x_test, y_train, y_test, feature_names, classes = \
            create_cancer_data()
        x_train = pd.DataFrame(x_train, columns=feature_names)
        x_test = pd.DataFrame(x_test, columns=feature_names)
        models = create_models(x_train, y_train)
        x_train[LABELS] = y_train
        x_test[LABELS] = y_test

        for model in models:
            run_raianalyzer(model, x_train, x_test, LABELS, classes)

    def test_raianalyzer_binary(self):
        x_train, y_train, x_test, y_test, classes = \
            create_binary_classification_dataset()
        x_train = pd.DataFrame(x_train)
        x_test = pd.DataFrame(x_test)
        models = create_models(x_train, y_train)
        x_train[LABELS] = y_train
        x_test[LABELS] = y_test

        for model in models:
            run_raianalyzer(model, x_train, x_test, LABELS, classes)


def run_raianalyzer(model, x_train, x_test, target_column, classes):
    task_type = ModelTask.CLASSIFICATION
    raianalyzer = RAIAnalyzer(model, x_train, x_test, target_column,
                              task_type=task_type)
    raianalyzer.explainer.add()
    # Validate calling add multiple times prints a warning
    with pytest.warns(UserWarning):
        raianalyzer.explainer.add()
    raianalyzer.explainer.compute()
    validate_raianalyzer(raianalyzer, x_train, x_test, target_column,
                         task_type)
    validate_explainer(raianalyzer, x_train, x_test, classes)
    with TemporaryDirectory() as tempdir:
        path = Path(tempdir) / 'explanation'
        # save the raianalyzer
        raianalyzer.save(path)
        # load the raianalyzer
        raianalyzer = RAIAnalyzer.load(path)
        raianalyzer.explainer.compute()
        validate_raianalyzer(raianalyzer, x_train, x_test, target_column,
                             task_type)
        validate_explainer(raianalyzer, x_train, x_test, classes)


def validate_raianalyzer(raianalyzer, x_train, x_test, target_column,
                         task_type):
    pd.testing.assert_frame_equal(raianalyzer.train, x_train)
    pd.testing.assert_frame_equal(raianalyzer.test, x_test)
    assert raianalyzer.target_column == target_column
    assert raianalyzer.task_type == task_type
    np.testing.assert_array_equal(raianalyzer._classes,
                                  x_train[target_column].unique())


def validate_explainer(raianalyzer, x_train, x_test, classes):
    explanations = raianalyzer.explainer.get()
    assert isinstance(explanations, list)
    assert len(explanations) == 1
    explanation = explanations[0]
    assert len(explanation.local_importance_values) == len(classes)
    assert len(explanation.local_importance_values[0]) == len(x_test)
    num_cols = len(x_train.columns) - 1
    assert len(explanation.local_importance_values[0][0]) == num_cols
    properties = raianalyzer.explainer.list()
    assert properties[ListProperties.MANAGER_TYPE] == ManagerNames.EXPLAINER
    assert 'id' in properties
    assert properties['method'] == LIGHTGBM_METHOD
    assert properties['model_task'] == ModelTask.CLASSIFICATION
    assert properties['model_type'] is None
    assert properties['is_raw'] is False
    assert properties['is_engineered'] is False
