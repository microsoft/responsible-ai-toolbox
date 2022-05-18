# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from responsibleai._tools.data_balance import BaseDataBalanceService
from responsibleai._tools.data_balance.pandas_data_balance_service import \
    PandasDataBalanceService
from responsibleai._tools.data_balance.spark_data_balance_service import \
    SparkDataBalanceService
from responsibleai._tools.shared.backends import SupportedBackend


class DataBalanceServiceFactory(object):
    """
    Data balance factory.
    """

    @staticmethod
    def get_service(backend: SupportedBackend) -> BaseDataBalanceService:
        """
        Get a specific data balance service.

        :param backend: The backend to use.
        :type backend: SupportedBackend
        """
        if backend == SupportedBackend.SPARK:
            return SparkDataBalanceService
        elif backend == SupportedBackend.PANDAS:
            return PandasDataBalanceService

        raise ValueError(f"Backend '{backend}' is not supported.")
