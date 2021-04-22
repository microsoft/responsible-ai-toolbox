# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
import pandas as pd
from common_utils import (create_iris_data, create_cancer_data,
                          create_models_classification,
                          create_models_regression,
                          create_boston_data)
from raitools import RAIAnalyzer, ModelTask
from raitools.exceptions import (
    DuplicateCounterfactualConfigException, UserConfigValidationException
)


LABELS = "labels"


class TestRAIAnalyzerCounterfactualMulticlass(object):

    def test_raianalyzer_iris(self):
        x_train, x_test, y_train, y_test, feature_names, classes = \
            create_iris_data()
        x_train = pd.DataFrame(x_train, columns=feature_names)
        x_test = pd.DataFrame(x_test, columns=feature_names)
        models = create_models_classification(x_train, y_train)
        x_train[LABELS] = y_train
        x_test[LABELS] = y_test

        for model in models:
            run_counterfactual_rai_analyzer(model, x_train, x_test, LABELS,
                                            classes, desired_class=0)


class TestRAIAnalyzerCounterfactualBinary(object):

    def test_raianalyzer_cancer(self):
        x_train, x_test, y_train, y_test, feature_names, classes = \
            create_cancer_data()
        x_train = pd.DataFrame(x_train, columns=feature_names)
        x_test = pd.DataFrame(x_test, columns=feature_names)
        models = create_models_classification(x_train, y_train)
        x_train[LABELS] = y_train
        x_test[LABELS] = y_test

        for model in models:
            run_counterfactual_rai_analyzer(model, x_train, x_test, LABELS,
                                            classes, desired_class="opposite")


class TestRAIAnalyzerCounterfactualRegression(object):

    def test_raianalyzer_boston(self):
        x_train, x_test, y_train, y_test, feature_names = \
            create_boston_data()
        x_train = pd.DataFrame(x_train, columns=feature_names)
        x_test = pd.DataFrame(x_test, columns=feature_names)
        models = create_models_regression(x_train, y_train)
        x_train[LABELS] = y_train
        x_test[LABELS] = y_test

        for model in models:
            run_counterfactual_rai_analyzer(model, x_train, x_test, LABELS,
                                            desired_range=[10, 20])


def run_counterfactual_rai_analyzer(model, x_train, x_test, target_column,
                                    classes=None, desired_class=None,
                                    desired_range=None):
    if classes is not None:
        task_type = ModelTask.CLASSIFICATION
    else:
        task_type = ModelTask.REGRESSION
    cf_analyzer = RAIAnalyzer(model, x_train, x_test[0:1], target_column,
                              task_type=task_type)
    continuous_features = list(set(x_train.columns) - set([target_column]))

    # Add the first configuration
    cf_analyzer.counterfactual.add(continuous_features=continuous_features,
                                   total_CFs=10,
                                   method='random',
                                   desired_class=desired_class,
                                   desired_range=desired_range)
    cf_analyzer.counterfactual.compute()
    assert cf_analyzer.counterfactual.get() is not None
    assert isinstance(cf_analyzer.counterfactual.get(), list)
    assert len(cf_analyzer.counterfactual.get()) == 1

    # Add a duplicate configuration
    with pytest.raises(DuplicateCounterfactualConfigException):
        cf_analyzer.counterfactual.add(continuous_features=continuous_features,
                                       total_CFs=10,
                                       method='random',
                                       desired_class=desired_class,
                                       desired_range=desired_range)

    # Add the second configuration
    cf_analyzer.counterfactual.add(continuous_features=continuous_features,
                                   total_CFs=1,
                                   method='random',
                                   desired_class=desired_class,
                                   desired_range=desired_range)
    cf_analyzer.counterfactual.compute()
    assert cf_analyzer.counterfactual.get() is not None
    assert isinstance(cf_analyzer.counterfactual.get(), list)
    assert len(cf_analyzer.counterfactual.get()) == 2

    # Add a bad configuration
    cf_analyzer.counterfactual.add(continuous_features=continuous_features,
                                   total_CFs=-1,
                                   method='random',
                                   desired_class=desired_class,
                                   desired_range=desired_range)
    cf_analyzer.counterfactual.compute()
    assert cf_analyzer.counterfactual.get() is not None
    assert isinstance(cf_analyzer.counterfactual.get(), list)
    assert len(cf_analyzer.counterfactual.get()) == 2
    assert len(cf_analyzer.counterfactual.get(failed_to_compute=True)) == 1

    if task_type == ModelTask.REGRESSION:
        with pytest.raises(UserConfigValidationException):
            cf_analyzer.counterfactual.add(
                continuous_features=continuous_features,
                total_CFs=10,
                method='random',
                desired_range=None)
    else:
        with pytest.raises(UserConfigValidationException):
            cf_analyzer.counterfactual.add(
                continuous_features=continuous_features,
                total_CFs=10,
                method='random',
                desired_class=None)
