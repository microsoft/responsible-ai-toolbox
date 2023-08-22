# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest

from raiutils.exceptions import UserConfigValidationException
from responsibleai._data_validations import \
    _validate_unique_operation_on_categorical_columns

TARGET = 'target'


class TestDataValidations:
    def test_dirty_train_test_data(self):
        X_train = pd.DataFrame(data=[['1', np.nan], ['2', '3']],
                               columns=['c1', 'c2'])
        y_train = np.array([1, 0])
        X_test = pd.DataFrame(data=[['1', '2'], ['2', '3']],
                              columns=['c1', 'c2'])
        y_test = np.array([1, 0])

        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            _validate_unique_operation_on_categorical_columns(
                train_data=X_train,
                test_data=X_test,
                categorical_features=['c2'])

        assert 'Error finding unique values in column c2. ' + \
            'Please check your train data.' in str(ucve.value)

        with pytest.raises(UserConfigValidationException) as ucve:
            _validate_unique_operation_on_categorical_columns(
                train_data=X_test,
                test_data=X_train,
                categorical_features=['c2'])

        assert 'Error finding unique values in column c2. ' + \
            'Please check your test data.' in str(ucve.value)
