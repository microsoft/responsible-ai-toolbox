# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import pytest
from tests.common_utils import create_adult_income_dataset


@pytest.fixture(scope='session')
def adult_data():
    return create_adult_income_dataset()
