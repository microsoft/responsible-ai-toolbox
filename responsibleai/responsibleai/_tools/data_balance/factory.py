# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from responsibleai._tools.data_balance import BaseDataBalance
from responsibleai._tools.data_balance.pandas_data_balance import (
    PandasDataBalance
)
from responsibleai._tools.data_balance.spark_data_balance import (
    SparkDataBalance
)
from responsibleai._tools.shared.backends import SupportedBackend


class DataBalanceFactory(object):
    """
    Data balance factory.
    """

    @staticmethod
    def get_service(backend: SupportedBackend) -> BaseDataBalance:
        """
        Get a specific data balance service.

        :param backend: The backend to use.
        :type backend: SupportedBackend
        """
        if backend == SupportedBackend.SPARK:
            return SparkDataBalance
        elif backend == SupportedBackend.PANDAS:
            return PandasDataBalance

        raise ValueError(f"Backend {backend} is not supported.")
