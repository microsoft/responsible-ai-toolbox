# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
from responsibleai._tools.data_balance.factory import (
    DataBalanceServiceFactory,
)
from responsibleai._tools.data_balance.pandas_data_balance_service import (
    PandasDataBalanceService,
)
from responsibleai._tools.data_balance.spark_data_balance_service import (
    SparkDataBalanceService,
)
from responsibleai._tools.shared.backends import SupportedBackend


class TestDataBalanceServiceFactory:
    def test_get_service_with_valid_backends(self):
        assert (
            DataBalanceServiceFactory.get_service(
                backend=SupportedBackend.SPARK
            )
            == SparkDataBalanceService
        )

        assert (
            DataBalanceServiceFactory.get_service(
                backend=SupportedBackend.PANDAS
            )
            == PandasDataBalanceService
        )

    def test_get_service_with_invalid_backends(self):
        with pytest.raises(
            ValueError, match="Backend 'None' is not supported."
        ):
            DataBalanceServiceFactory.get_service(backend=None)

        with pytest.raises(ValueError, match="Backend '' is not supported."):
            DataBalanceServiceFactory.get_service(backend="")

        with pytest.raises(
            ValueError, match="Backend 'invalid' is not supported."
        ):
            DataBalanceServiceFactory.get_service(backend="invalid")
