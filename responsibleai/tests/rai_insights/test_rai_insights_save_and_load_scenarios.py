# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os
from pathlib import Path
from tempfile import TemporaryDirectory

import numpy as np
import pandas as pd
import pytest
from tests.common_utils import create_iris_data

from rai_test_utils.datasets.tabular import \
    create_binary_classification_dataset
from rai_test_utils.models.lightgbm import create_lightgbm_classifier
from rai_test_utils.models.sklearn import \
    create_complex_classification_pipeline
from raiutils.models import ModelTask
from responsibleai import RAIInsights
from responsibleai._internal.constants import (ManagerNames,
                                               SerializationAttributes)
from responsibleai.feature_metadata import FeatureMetadata

LABELS = 'labels'


class TestRAIInsightsSaveAndLoadScenarios(object):

    def test_rai_insights_empty_save_load_save(self):
        X_train, y_train, X_test, y_test, classes = \
            create_binary_classification_dataset()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train[LABELS] = y_train
        X_test[LABELS] = y_test

        rai_insights = RAIInsights(
            model, X_train, X_test,
            LABELS,
            categorical_features=None,
            task_type=ModelTask.CLASSIFICATION)

        with TemporaryDirectory() as tmpdir:
            save_1 = Path(tmpdir) / "first_save"
            save_2 = Path(tmpdir) / "second_save"

            # Save it
            rai_insights.save(save_1)
            assert len(os.listdir(save_1 / ManagerNames.CAUSAL)) == 0
            assert len(os.listdir(save_1 / ManagerNames.COUNTERFACTUAL)) == 0
            assert len(os.listdir(save_1 / ManagerNames.DATA_BALANCE)) == 0
            assert len(os.listdir(save_1 / ManagerNames.ERROR_ANALYSIS)) == 0
            assert len(os.listdir(save_1 / ManagerNames.EXPLAINER)) == 0

            # Load
            rai_2 = RAIInsights.load(save_1)

            # Validate, but this isn't the main check
            validate_rai_insights(
                rai_2, X_train, X_test,
                LABELS, ModelTask.CLASSIFICATION)

            # Save again (this is where Issue #1046 manifested)
            rai_2.save(save_2)
            assert len(os.listdir(save_2 / ManagerNames.CAUSAL)) == 0
            assert len(os.listdir(save_2 / ManagerNames.COUNTERFACTUAL)) == 0
            assert len(os.listdir(save_2 / ManagerNames.DATA_BALANCE)) == 0
            assert len(os.listdir(save_2 / ManagerNames.ERROR_ANALYSIS)) == 0
            assert len(os.listdir(save_2 / ManagerNames.EXPLAINER)) == 0

    @pytest.mark.parametrize('manager_type', [ManagerNames.CAUSAL,
                                              ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.EXPLAINER,
                                              ManagerNames.COUNTERFACTUAL,
                                              ManagerNames.DATA_BALANCE])
    def test_rai_insights_save_load_add_save(self, manager_type, adult_data):
        data_train, data_test, y_train, y_test, categorical_features, \
            continuous_features, target_name, classes, \
            feature_columns, feature_range_keys = adult_data
        X_train = data_train.drop([target_name], axis=1)

        model = create_complex_classification_pipeline(
            X_train, y_train, continuous_features, categorical_features)

        # Cut down size for counterfactuals, in the interests of speed
        if manager_type == ManagerNames.COUNTERFACTUAL:
            data_test = data_test[0:1]

        rai_insights = RAIInsights(
            model, data_train, data_test,
            target_name,
            categorical_features=categorical_features,
            task_type=ModelTask.CLASSIFICATION,
            feature_metadata=FeatureMetadata(identity_feature_name="age"))

        with TemporaryDirectory() as tmpdir:
            save_1 = Path(tmpdir) / "first_save"
            save_2 = Path(tmpdir) / "second_save"

            # Save it
            rai_insights.save(save_1)

            # Load
            rai_2 = RAIInsights.load(save_1)

            # Call a single manager
            if manager_type == ManagerNames.CAUSAL:
                rai_2.causal.add(
                    treatment_features=['age', 'hours_per_week']
                )
            elif manager_type == ManagerNames.COUNTERFACTUAL:
                rai_2.counterfactual.add(
                    total_CFs=10,
                    desired_class='opposite',
                    feature_importance=False
                )
            elif manager_type == ManagerNames.DATA_BALANCE:
                rai_2._data_balance_manager.add(
                    cols_of_interest=categorical_features
                )
            elif manager_type == ManagerNames.ERROR_ANALYSIS:
                rai_2.error_analysis.add()
            elif manager_type == ManagerNames.EXPLAINER:
                rai_2.explainer.add()
            else:
                raise ValueError(
                    "Bad manager_type: {0}".format(manager_type))

            rai_2.compute()

            # Validate, but this isn't the main check
            validate_rai_insights(
                rai_2, data_train, data_test,
                target_name, ModelTask.CLASSIFICATION,
                categorical_features=categorical_features,
                feature_range_keys=feature_range_keys,
                feature_columns=feature_columns,
                feature_metadata=FeatureMetadata(identity_feature_name="age"))

            # Save again (this is where Issue #1046 manifested)
            rai_2.save(save_2)

    @pytest.mark.parametrize('target_dir', [ManagerNames.CAUSAL,
                                            ManagerNames.ERROR_ANALYSIS,
                                            ManagerNames.COUNTERFACTUAL])
    def test_load_missing_dirs(self, target_dir, adult_data):
        # This test is about the case where an object has been saved to Azure
        # Directories only exist implicitly, so in a downloaded instance
        # if a manager had no outputs, then its subdirectory won't exist
        # The exception is the Explainer, which always creates a file
        # in its subdirectory
        data_train, data_test, y_train, y_test, categorical_features, \
            continuous_features, target_name, classes, \
            feature_columns, feature_range_keys = adult_data
        X_train = data_train.drop([target_name], axis=1)

        model = create_complex_classification_pipeline(
            X_train, y_train, continuous_features, categorical_features)
        rai_insights = RAIInsights(
            model, data_train, data_test,
            target_name,
            categorical_features=categorical_features,
            task_type=ModelTask.CLASSIFICATION)

        with TemporaryDirectory() as tmpdir:
            save_1 = Path(tmpdir) / "first_save"

            # Save it
            rai_insights.save(save_1)

            # Remove the target directory
            # First make sure it's empty
            dir_to_remove = save_1 / target_dir
            assert len(list(dir_to_remove.iterdir())) == 0
            os.rmdir(dir_to_remove)
            assert not dir_to_remove.exists()

            # Load
            rai_2 = RAIInsights.load(save_1)
            assert rai_2 is not None

    def test_loading_rai_insights_without_model_file(self):
        X_train, X_test, y_train, y_test, feature_names, classes = \
            create_iris_data()
        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        rai_insights = RAIInsights(
            model=model,
            train=X_train,
            test=X_test,
            target_column='target',
            task_type='classification')

        with TemporaryDirectory() as tmpdir:
            assert rai_insights.model is not None
            save_path = Path(tmpdir) / "rai_insights"
            rai_insights.save(save_path)

            # Remove the model.pkl file to cause an exception to occur
            # while loading the model.
            model_pkl_path = Path(tmpdir) / \
                "rai_insights" / SerializationAttributes.MODEL_PKL
            os.remove(model_pkl_path)
            with pytest.raises(Exception):
                RAIInsights.load(save_path)

    @pytest.mark.parametrize('manager_type', [ManagerNames.CAUSAL,
                                              ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.EXPLAINER,
                                              ManagerNames.COUNTERFACTUAL,
                                              ManagerNames.DATA_BALANCE])
    def test_rai_insights_add_save_load_save(self, manager_type, adult_data):
        data_train, data_test, y_train, y_test, categorical_features, \
            continuous_features, target_name, classes, \
            feature_columns, feature_range_keys = adult_data
        X_train = data_train.drop([target_name], axis=1)

        model = create_complex_classification_pipeline(
            X_train, y_train, continuous_features, categorical_features)

        # Cut down size for counterfactuals, in the interests of speed
        if manager_type == ManagerNames.COUNTERFACTUAL:
            data_test = data_test[0:1]

        rai_insights = RAIInsights(
            model, data_train, data_test,
            target_name,
            categorical_features=categorical_features,
            task_type=ModelTask.CLASSIFICATION,
            feature_metadata=FeatureMetadata(identity_feature_name="age"))

        # Call a single manager
        if manager_type == ManagerNames.CAUSAL:
            rai_insights.causal.add(
                treatment_features=['age', 'hours_per_week']
            )
        elif manager_type == ManagerNames.COUNTERFACTUAL:
            rai_insights.counterfactual.add(
                total_CFs=10,
                desired_class='opposite',
                feature_importance=False
            )
        elif manager_type == ManagerNames.DATA_BALANCE:
            rai_insights._data_balance_manager.add(
                cols_of_interest=categorical_features
            )
        elif manager_type == ManagerNames.ERROR_ANALYSIS:
            rai_insights.error_analysis.add()
        elif manager_type == ManagerNames.EXPLAINER:
            rai_insights.explainer.add()
        else:
            raise ValueError(
                "Bad manager_type: {0}".format(manager_type))

        rai_insights.compute()

        with TemporaryDirectory() as tmpdir:
            save_1 = Path(tmpdir) / "first_save"
            save_2 = Path(tmpdir) / "second_save"

            # Save it
            rai_insights.save(save_1)

            # Load
            rai_2 = RAIInsights.load(save_1)

            # Validate, but this isn't the main check
            validate_rai_insights(
                rai_2, data_train, data_test,
                target_name, ModelTask.CLASSIFICATION,
                categorical_features=categorical_features,
                feature_range_keys=feature_range_keys,
                feature_columns=feature_columns,
                feature_metadata=FeatureMetadata(identity_feature_name="age"))

            # Save again (this is where Issue #1081 manifested)
            rai_2.save(save_2)


def validate_rai_insights(
    rai_insights,
    train_data,
    test_data,
    target_column,
    task_type,
    categorical_features=None,
    feature_range_keys=None,
    feature_columns=None,
    feature_metadata=None
):
    pd.testing.assert_frame_equal(rai_insights.train, train_data)
    pd.testing.assert_frame_equal(rai_insights.test, test_data)
    assert rai_insights.target_column == target_column
    assert rai_insights.task_type == task_type
    assert rai_insights.categorical_features == (categorical_features or [])
    if feature_range_keys is not None:
        assert feature_range_keys.sort() == \
            list(rai_insights._feature_ranges[0].keys()).sort()
    if feature_columns is not None:
        assert rai_insights._feature_columns == (feature_columns or [])
    if feature_metadata is not None:
        # mismatch between categorical_features passed in RAIInsights
        # constructor and the categorical_features set on the feature_metadata
        if (categorical_features is not None and
                feature_metadata.categorical_features is None):
            feature_metadata.categorical_features = categorical_features
        assert rai_insights._feature_metadata == feature_metadata
    assert target_column not in rai_insights._feature_columns

    if rai_insights.model is None:
        assert rai_insights._predict_output is None
        assert rai_insights._predict_proba_output is None
    else:
        assert rai_insights._predict_output is not None
        if task_type == ModelTask.CLASSIFICATION:
            assert rai_insights._predict_proba_output is not None
            assert isinstance(rai_insights._predict_proba_output, np.ndarray)
            assert len(rai_insights._predict_proba_output.tolist()[0]) == \
                len(rai_insights._classes)

    if task_type == ModelTask.CLASSIFICATION:
        classes = train_data[target_column].unique()
        classes.sort()
        np.testing.assert_array_equal(rai_insights._classes,
                                      classes)
