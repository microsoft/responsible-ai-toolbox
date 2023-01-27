# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Data Balance Manager class."""

import json
import warnings
from pathlib import Path
from typing import Dict, List

import numpy as np
import pandas as pd

from responsibleai._interfaces import TaskType
from responsibleai._internal.constants import DataBalanceManagerKeys as Keys
from responsibleai._internal.constants import (FileFormats, ListProperties,
                                               ManagerNames)
from responsibleai._tools.shared.state_directory_management import \
    DirectoryManager
from responsibleai.databalanceanalysis import (AggregateBalanceMeasures,
                                               DistributionBalanceMeasures,
                                               FeatureBalanceMeasures)
from responsibleai.databalanceanalysis.data_balance_utils import (
    prepare_df, transform_measures_to_dict)
from responsibleai.managers.base_manager import BaseManager

DATA_JSON = f"data{FileFormats.JSON}"
MANAGER_JSON = f"manager{FileFormats.JSON}"
MEASURES_JSON = f"measures{FileFormats.JSON}"


class DataBalanceManager(BaseManager):
    """
    Defines the DataBalanceManager for finding data balance measures
    on a dataset.
    """

    def __init__(
        self,
        train: pd.DataFrame,
        test: pd.DataFrame,
        target_column: str,
        classes: np.ndarray,
        task_type: TaskType,
    ):
        """
        Creates a DataBalanceManager object.

        :param train: The training data.
        :type train: pd.DataFrame
        :param test: The test data.
        :type test: pd.DataFrame
        :param target_column: The name of the target column.
        :type target_column: str
        :param classes: The classes of the target column.
        :type classes: np.ndarray
        :param task_type: The task type of the data.
        :type task_type: TaskType
        """
        self._train = train
        self._test = test
        self._target_column = target_column
        # Eagerly convert numpy array to list of strs for serialization
        self._classes = (
            list(map(str, classes)) if classes is not None else None
        )
        self._task_type = task_type
        self._is_added = False

        self._df = None
        if self._train is not None or self._test is not None:
            self._df = pd.concat([self._train, self._test])

        # Populated in add()
        self._cols_of_interest = None

        # Populated in compute()
        self._data_balance_measures = None

    def add(self, cols_of_interest: List[str]):
        """
        Add data balance measures to be computed later.

        :param cols_of_interest: The names of the columns to be used
            for computing data balance measures.
        :type cols_of_interest: List[str]
        """
        self._cols_of_interest = cols_of_interest

        # Let user see exceptions early in add() before calling compute()
        self._validate()
        self._is_added = True

    def _validate(self):
        """
        Validate that data balance measures can be computed. Raises ValueError
        if not valid.
        """
        if self._train is None and self._test is None:
            raise ValueError(
                (
                    "Either `train` or `test` must be provided to RAIInsights"
                    " to compute data balance measures."
                )
            )

        if not self._target_column:
            raise ValueError(
                (
                    "The `target_column` must be provided to compute"
                    " data balance measures."
                )
            )

        if self._target_column not in self._df.columns:
            raise ValueError(
                (
                    f"The target_column '{self._target_column}' must be"
                    " present in the dataset."
                )
            )

        if not self._classes:
            raise ValueError(
                (
                    f"The target_column '{self._target_column}' must have"
                    " at least one value."
                )
            )

        if self._task_type != TaskType.CLASSIFICATION:
            raise ValueError(
                (
                    f"The task_type '{self._task_type}' must be"
                    " 'classification' to compute data balance measures."
                )
            )

        if not self._cols_of_interest:
            raise ValueError(
                (
                    "The `cols_of_interest` must be provided to compute"
                    " data balance measures."
                )
            )

        if not all(col in self._df.columns for col in self._cols_of_interest):
            raise ValueError(
                (
                    "All columns in `cols_of_interest` must be present in"
                    " the dataset."
                )
            )

    def compute(self):
        """
        Computes data balance measures on the dataset.
        """
        if not self._is_added:
            return

        try:
            self._validate()

            self._df = prepare_df(df=self._df)

            feature_balance_measures = {}
            for pos_label in self._classes:
                feature_balance_measures[pos_label] = FeatureBalanceMeasures(
                    cols_of_interest=self._cols_of_interest,
                    label_col=self._target_column,
                    pos_label=pos_label,
                ).measures(dataset=self._df)

            distribution_balance_measures = DistributionBalanceMeasures(
                cols_of_interest=self._cols_of_interest
            ).measures(dataset=self._df)
            aggregate_balance_measures = AggregateBalanceMeasures(
                cols_of_interest=self._cols_of_interest
            ).measures(dataset=self._df)

            self._set_data_balance_measures(
                feature_balance_measures=feature_balance_measures,
                distribution_balance_measures=distribution_balance_measures,
                aggregate_balance_measures=aggregate_balance_measures,
            )
        except Exception as e:
            warnings.warn(
                f"Failed to compute data balance measures due to {e!r}."
            )

    def _set_data_balance_measures(
        self,
        feature_balance_measures: Dict[str, pd.DataFrame],
        distribution_balance_measures: pd.DataFrame,
        aggregate_balance_measures: pd.DataFrame,
    ):
        """
        Take the data balance measure DataFrames, transform them into
        a dictionary, and set them as an instance variable.

        :param feature_balance_measures: Feature balance measures.
        :type feature_balance_measures: Dict[str, pd.DataFrame]
        :param distribution_balance_measures: Distribution balance measures.
        :type distribution_balance_measures: pd.DataFrame
        :param aggregate_balance_measures: Aggregate balance measures.
        :type aggregate_balance_measures: pd.DataFrame
        """
        self._data_balance_measures = transform_measures_to_dict(
            feature_balance_measures=feature_balance_measures,
            distribution_balance_measures=distribution_balance_measures,
            aggregate_balance_measures=aggregate_balance_measures,
        )

    def get(self):
        """
        Get the computed data balance measures.

        :return: The computed data balance measures.
        :rtype: Dict[str, Any]
        """
        return (
            self._data_balance_measures if self._data_balance_measures else {}
        )

    def list(self):
        """
        List information about the data balance manager.

        :return: Information about the data balance manager.
        :rtype: Dict[str, Any]
        """
        props = {
            ListProperties.MANAGER_TYPE: self.name,
            Keys.IS_ADDED: self._is_added,
            Keys.TASK_TYPE: self._task_type,
            Keys.COLS_OF_INTEREST: self._cols_of_interest,
            Keys.TARGET_COLUMN: self._target_column,
            Keys.CLASSES: self._classes,
        }

        return props

    def get_data(self):
        """
        Get the computed data balance measures. This is the same as calling
        get() because data balance measures are part of the Dataset interface
        rather than on their own (such as CausalData, CounterfactualData, etc).

        :return: The computed data balance measures.
        :rtype: Dict[str, Any]
        """
        return self.get()

    @property
    def name(self):
        return ManagerNames.DATA_BALANCE

    def _save(self, path):
        """
        Save the DataBalanceManager to the given path.

        :param path: The directory path to save the DataBalanceManager to.
        :type path: str
        """
        top_dir = Path(path)
        top_dir.mkdir(parents=True, exist_ok=True)

        # If manager is not added to RAIInsights, don't save any of its configs
        if not self._is_added:
            return

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
        self._df.to_json(data_path, orient="split")

    @staticmethod
    def _load(path, rai_insights):
        """
        Load the DataBalanceManager from the given path.

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

        inst.__dict__["_train"] = rai_insights.train
        inst.__dict__["_test"] = rai_insights.test

        is_added = False
        cols_of_interest = None
        task_type = rai_insights.task_type
        target_column = rai_insights.target_column
        classes = (
            list(map(str, rai_insights._classes))
            if rai_insights._classes is not None
            else []
        )
        df = pd.concat([rai_insights.train, rai_insights.test])
        data_balance_measures = None

        all_db_dirs = DirectoryManager.list_sub_directories(path)
        if len(all_db_dirs) != 0:
            dir_manager = DirectoryManager(
                parent_directory_path=path, sub_directory_name=all_db_dirs[0]
            )
            config_dir = dir_manager.get_config_directory()

            # Load manager
            with open(config_dir / MANAGER_JSON, "r") as f:
                manager_info = json.load(f)
                is_added = manager_info[Keys.IS_ADDED]
                task_type = manager_info[Keys.TASK_TYPE]
                cols_of_interest = manager_info[Keys.COLS_OF_INTEREST]
                target_column = manager_info[Keys.TARGET_COLUMN]
                classes = manager_info[Keys.CLASSES]

            # Load from data json
            data_path = dir_manager.get_data_directory() / DATA_JSON
            if data_path.exists():
                df = pd.read_json(data_path, orient="split")

            # Load measures
            measures_path = config_dir / MEASURES_JSON
            if measures_path.exists():
                with open(measures_path, "r") as f:
                    data_balance_measures = json.load(f)

        inst.__dict__["_is_added"] = is_added
        inst.__dict__["_task_type"] = task_type
        inst.__dict__["_cols_of_interest"] = cols_of_interest
        inst.__dict__["_target_column"] = target_column
        inst.__dict__["_classes"] = classes
        inst.__dict__["_df"] = df
        inst.__dict__["_data_balance_measures"] = data_balance_measures

        return inst
