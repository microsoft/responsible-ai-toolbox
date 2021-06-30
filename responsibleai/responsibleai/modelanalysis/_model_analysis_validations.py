# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Validations for model analysis."""

import pandas as pd

from responsibleai.modelanalysis.constants import ModelTask
from responsibleai.exceptions import UserConfigValidationException


def _validate_model_analysis_input_parameters(
        model, train, test, target_column,
        task_type, categorical_features=None, train_labels=None,
        serializer=None):
    """
    Validate the inputs for ModelAnalysis class.

    :param model: The model to compute RAI insights for.
        A model that implements sklearn.predict or sklearn.predict_proba
        or function that accepts a 2d ndarray.
    :type model: object
    :param train: The training dataset including the label column.
    :type train: pandas.DataFrame
    :param test: The test dataset including the label column.
    :type test: pandas.DataFrame
    :param target_column: The name of the label column.
    :type target_column: str
    :param task_type: The task to run, can be `classification` or
        `regression`.
    :type task_type: str
    :param categorical_features: The categorical feature names.
    :type categorical_features: list[str]
    :param train_labels: The class labels in the training dataset
    :type train_labels: ndarray
    :param serializer: Picklable custom serializer with save and load
        methods defined for model that is not serializable. The save
        method returns a dictionary state and load method returns the model.
    :type serializer: object
    """

    if task_type != ModelTask.CLASSIFICATION and \
            task_type != ModelTask.REGRESSION:
        raise UserConfigValidationException(
            'Unsupported task type. Should be one of {0} or {1}'.format(
                ModelTask.CLASSIFICATION, ModelTask.REGRESSION)
        )

    if isinstance(train, pd.DataFrame) and isinstance(test, pd.DataFrame):
        if len(set(train.columns) - set(test.columns)) != 0 or \
                len(set(test.columns) - set(train.columns)):
            raise UserConfigValidationException(
                'The features in train and test data do not match')

        if target_column not in list(train.columns) or \
                target_column not in list(test.columns):
            raise UserConfigValidationException(
                'Target name {0} not present in train/test data'.format(
                    target_column)
            )

        if categorical_features is not None and len(categorical_features) > 0:
            if target_column in categorical_features:
                raise UserConfigValidationException(
                    'Found target name {0} in categorical feature list'.format(
                        target_column)
                )

            if not set(categorical_features).issubset(set(train.columns)):
                raise UserConfigValidationException(
                    'Found some feature names in categorical feature which do'
                    ' not occur in train data'
                )

        # Run predict of the model
        try:
            small_train_data = train.iloc[0:2].drop([target_column], axis=1)
            small_test_data = test.iloc[0:2].drop([target_column], axis=1)
            model.predict(small_train_data)
            model.predict(small_test_data)
        except Exception:
            raise UserConfigValidationException(
                'The model passed cannot be used for getting predictions'
            )
