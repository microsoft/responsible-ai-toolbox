# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Data Balance Manager class."""

import json
from pathlib import Path
from typing import Any, List, Optional, Union
import warnings

import pandas as pd

from responsibleai._internal.constants import DataBalanceManagerKeys as Keys
from responsibleai._internal.constants import ListProperties, ManagerNames
from responsibleai.managers.base_manager import BaseManager
from responsibleai._tools.data_balance.data_balance import DataBalance
from responsibleai._tools.shared.backends import SupportedBackend
from responsibleai._tools.shared.state_directory_management import (
    DirectoryManager,
)

DATA_JSON = "data.json"
MANAGER_JSON = "manager.json"
MEASURES_JSON = "measures.json"


class DataBalanceManager(BaseManager):

    """Defines the DataBalanceManager for finding
    data balance measures on a dataset."""

    def __init__(
        self,
        target_column: str,
        train: Optional[pd.DataFrame],
        test: Optional[pd.DataFrame],
    ):
        """Creates a DataBalanceManager object.

        :param target_column: The name of the target column.
        :type target_column: str
        :param train: The training data. This is optional if
            `custom_data` is provided in `add()`.
        :type train: pd.DataFrame
        :param test: The test data. This is optional if
            `train` is provided in the constructor or
            `custom_data` is provided in `add()`.
        :type test: pd.DataFrame
        """
        self._target_column = target_column
        self._train = train
        self._test = test

        self._df = None
        self._backend = None
        if self._train is not None or self._test is not None:
            self._df = pd.concat([self._train, self._test])
            self._backend = self._infer_backend()

        # Populated in add()
        self._cols_of_interest = None
        self._pos_label = None
        self._custom_data = None

        # Populated in compute()
        self._data_balance_measures = None

    def add(
        self,
        cols_of_interest: List[str],
        pos_label: Optional[str] = None,
        custom_data: Optional[Any] = None,
    ):
        """Add data balance measures to be computed later.

        :param cols_of_interest: The names of the columns to be used
            for computing data balance measures.
        :type cols_of_interest: List[str]
        :param pos_label: The name of the positive label.
        :type pos_label: str
        :param custom_data: A custom dataframe to be used for computing
            data balance measures. If this is passed in,
            `train` and `test` will be ignored.
        :type custom_data: pd.DataFrame or pyspark.sql.DataFrame"""
        self._cols_of_interest = cols_of_interest
        self._pos_label = pos_label
        self._custom_data = custom_data

        if self._custom_data is not None:
            self._df = self._custom_data
            self._backend = self._infer_backend()

        # Let user see warnings early in add() before calling compute()
        self._validate()

    def _infer_backend(self) -> SupportedBackend:
        if self._df is not None:
            if isinstance(self._df, pd.DataFrame):
                return SupportedBackend.PANDAS

            try:
                from pyspark.sql import DataFrame as SparkDF

                if isinstance(self._df, SparkDF):
                    return SupportedBackend.SPARK
            except ImportError:
                pass

        raise ValueError("Provided data is not a pandas or spark dataframe.")

    def _validate(self) -> bool:
        valid = True
        if not self._cols_of_interest or not self._target_column:
            warnings.warn(
                (
                    "Both `cols_of_interest` and `target_column` must be"
                    " provided to compute data balance measures."
                )
            )
            valid = False

        if (
            self._train is None
            and self._test is None
            and self._custom_data is None
        ):
            warnings.warn(
                (
                    "Either `train`, `test`, or `custom_data` must be provided"
                    " to compute data balance measures."
                )
            )
            valid = False

        return valid

    def compute(self):
        """Computes data balance measures on the dataset."""
        if not self._validate() or self._df is None:
            return

        self._df = DataBalance.prepare_df(
            df=self._df,
            target_column=self._target_column,
            pos_label=self._pos_label,
            backend=self._backend,
        )
        (
            feat_measures,
            dist_measures,
            agg_measures,
        ) = DataBalance.compute_measures(
            df=self._df,
            cols_of_interest=self._cols_of_interest,
            target_column=self._target_column,
            backend=self._backend,
        )
        self.set_data_balance_measures(
            feature_balance_measures=feat_measures,
            distribution_balance_measures=dist_measures,
            aggregate_balance_measures=agg_measures,
        )

    def set_data_balance_measures(
        self,
        feature_balance_measures: pd.DataFrame,
        distribution_balance_measures: pd.DataFrame,
        aggregate_balance_measures: pd.DataFrame,
    ):
        self._data_balance_measures = DataBalance.transform_measures_to_dict(
            feature_balance_measures=feature_balance_measures,
            distribution_balance_measures=distribution_balance_measures,
            aggregate_balance_measures=aggregate_balance_measures,
        )

    def get(self):
        """Get the computed data balance measures.

        :return: The computed data balance measures.
        :rtype: Dict[str, Any]
        """
        return (
            self._data_balance_measures if self._data_balance_measures else {}
        )

    def list(self):
        """List information about the data balance manager.

        :return: Information about the data balance manager.
        :rtype: Dict[str, Any]
        """
        props = {
            ListProperties.MANAGER_TYPE: self.name,
            Keys.IS_COMPUTED: self._data_balance_measures is not None,
            Keys.COLS_OF_INTEREST: self._cols_of_interest,
            Keys.TARGET_COLUMN: self._target_column,
            Keys.POS_LABEL: self._pos_label,
            Keys.BACKEND: self._backend.value,
        }

        return props

    def get_data(self):
        """Get the data balance measures.

        Must be called after add and compute methods.

        :return: The data balance measures.
        :rtype: Dict[str, Any]
        """
        return (
            self._data_balance_measures if self._data_balance_measures else {}
        )

    @property
    def name(self):
        return ManagerNames.DATA_BALANCE

    def _save(self, path):
        """Save the DataBalanceManager to the given path.

        :param path: The directory path to save the DataBalanceManager to.
        :type path: str
        """
        top_dir = Path(path)
        top_dir.mkdir(parents=True, exist_ok=True)

        dir_manager = DirectoryManager(parent_directory_path=path)
        config_dir = dir_manager.create_config_directory()

        manager_path = config_dir / MANAGER_JSON
        with open(manager_path, "w") as f:
            json.dump(self.list(), f)

        # if measures have been computed, save the computed measures
        if self._data_balance_measures:
            measures_path = config_dir / MEASURES_JSON
            with open(measures_path, "w") as f:
                json.dump(self._data_balance_measures, f)

        data_path = dir_manager.create_data_directory() / DATA_JSON
        if self._backend == SupportedBackend.SPARK:
            self._df.write.json(data_path)
        elif self._backend == SupportedBackend.PANDAS:
            self._df.to_json(data_path, orient="split")

    @staticmethod
    def _load(path, rai_insights):
        """Load the DataBalanceManager from the given path.

        :param path: The directory path to load the DataBalanceManager from.
        :type path: str
        :param rai_insights: The loaded parent RAIInsights.
        :type rai_insights: RAIInsights
        :return: The DataBalanceManager after loading.
        :rtype: DataBalanceManager
        """
        # create the DataBalanceManager without any properties using the
        # __new__ function, similar to pickle
        inst = DataBalanceManager.__new__(DataBalanceManager)

        inst.__dict__["_target_column"] = rai_insights.target_column
        inst.__dict__["_train"] = rai_insights.train
        inst.__dict__["_test"] = rai_insights.test

        # Due to the risk of custom_data being large, we don't save or load it
        inst.__dict__["_custom_data"] = None

        all_db_dirs = DirectoryManager.list_sub_directories(path)
        if len(all_db_dirs) != 0:
            dir_manager = DirectoryManager(
                parent_directory_path=path, sub_directory_name=all_db_dirs[0]
            )

            config_dir = dir_manager.get_config_directory()

            with open(config_dir / MANAGER_JSON, "r") as f:
                manager_info = json.load(f)
                inst.__dict__["_backend"] = SupportedBackend(
                    manager_info[Keys.BACKEND]
                )
                for k in [
                    Keys.COLS_OF_INTEREST,
                    Keys.TARGET_COLUMN,
                    Keys.POS_LABEL,
                ]:
                    inst.__dict__[f"_{k}"] = manager_info[k]

            data_path = dir_manager.get_data_directory() / DATA_JSON
            if data_path.exists():
                df = None
                if (
                    inst.__dict__.get("_backend")
                    == SupportedBackend.SPARK.value
                ):
                    try:
                        df = spark.read.json(data_path)
                    except Exception as e:
                        warnings.warn(
                            (
                                "Tried to load data using 'spark' "
                                f"backend, but failed due to {e!r}."
                                "Reverting to 'pandas' backend."
                            )
                        )

                if df is None:
                    df = pd.read_json(data_path, orient="split")

                inst.__dict__["_df"] = df

            measures_path = config_dir / MEASURES_JSON
            if measures_path.exists():
                with open(measures_path, "r") as f:
                    inst.__dict__["_data_balance_measures"] = json.load(f)
            else:
                inst.compute()

        return inst
