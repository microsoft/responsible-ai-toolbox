# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Data Balance Manager class."""

from enum import Enum
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union
import warnings

import pandas as pd
from raimitigations.databalanceanalysis import (
    FeatureBalanceMeasure,
    AggregateBalanceMeasure,
    DistributionBalanceMeasure,
)

try:
    import pyspark.sql.functions as F
    from synapse.ml import exploratory as SparkDataBalance
except ImportError:
    pass

from responsibleai._internal.constants import DataBalanceManagerKeys as Keys
from responsibleai._internal.constants import ListProperties, ManagerNames
from responsibleai.managers.base_manager import BaseManager
from responsibleai._tools.shared.state_directory_management import (
    DirectoryManager,
)

DATA_JSON = "data.json"
MANAGER_JSON = "manager.json"
MEASURES_JSON = "measures.json"

FEATURE_NAME = "FeatureName"
CLASS_A = "ClassA"
CLASS_B = "ClassB"

SPARK_AGGREGATE_COL = "AggregateBalanceMeasure.*"
SPARK_DISTRIBUTION_COL = "DistributionBalanceMeasure.*"
SPARK_FEATURE_COL = "FeatureBalanceMeasure.*"


class SupportedBackend(Enum):
    """Supported backends for finding data balance measures on a dataset."""

    PANDAS = "pandas"
    SPARK = "spark"


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

        # Populated later
        self._cols_of_interest = None
        self._pos_label = None
        self._custom_data = None
        self._backend = None
        self._df = None
        self._data_balance_measures = None

    def add(
        self,
        cols_of_interest: List[str],
        pos_label: Optional[str] = None,
        custom_data: Optional[Any] = None,
        backend: SupportedBackend = "pandas",
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
        :type custom_data: pd.DataFrame or pyspark.sql.DataFrame
        :param backend: The backend to use for computing data balance
            measures. Can be either "pandas" or "spark". Default is "pandas".
            The `backend` must match the `custom_data` type:
                - If `custom_data` is a pd.DataFrame, specify "pandas"
                - If `custom_data` is a pyspark.sql.DataFrame, specify "spark"
        :type backend: str"""
        self._cols_of_interest = cols_of_interest
        self._pos_label = pos_label
        self._custom_data = custom_data
        self._backend = backend

        # Let user see warnings early when adding data balance measures
        if not self._validate():
            return

        self._df = self._get_df()

    def compute(self):
        """Computes data balance measures on the dataset."""
        if not self._validate() or not self._df:
            return

        self._data_balance_measures = (
            DataBalanceManager._get_data_balance_measures(
                df=self._df,
                cols_of_interest=self._cols_of_interest,
                target_column=self._target_column,
                pos_label=self._pos_label,
                backend=self._backend,
            )
        )

    def _validate(self) -> bool:
        if not self._cols_of_interest or not self._target_column:
            warnings.warn(
                (
                    "Both `cols_of_interest` and `target_column` must be"
                    " provided to compute data balance measures."
                )
            )
            return False

        supported_backends = [b.value for b in SupportedBackend]
        if self._backend not in supported_backends:
            warnings.warn(
                (
                    "`backend` must be one of the supported backends:"
                    f"{supported_backends.join(', ')}"
                    "to compute data balance measures."
                )
            )
            return False

        return True

    def _get_df(self) -> Optional[Union[pd.DataFrame, Any]]:
        if self._custom_data is not None:
            # custom_data could be pd.DataFrame or pyspark.sql.DataFrame
            return self._custom_data
        elif (
            # train and test are pd.DataFrames so we can check for empty
            self._train is not None
            and not self._train.empty
            and self._test is not None
            and not self._test.empty
        ):
            return pd.concat([self._train, self._test])
        elif self._train is not None and not self._train.empty:
            return self._train
        elif self._test is not None and not self._test.empty:
            return self._test

        warnings.warn(
            (
                "Either `train`, `test`, or `custom_data` must be provided"
                " to compute data balance measures."
            )
        )
        return None

    def get(self):
        """List information about the data balance manager.

        :return: Information about the data balance manager.
        :rtype: Dict[str, Any]
        """
        return self._get_manager_info()

    def list(self):
        """List information about the data balance manager.

        :return: Information about the data balance manager.
        :rtype: Dict[str, Any]
        """
        return self._get_manager_info()

    def _get_manager_info(self):
        """Gets information about the data balance manager.

        RAIInsights uses the manager's get() and list() for the
        same exact function: to get information about the manager.
        """
        props = {
            ListProperties.MANAGER_TYPE: self.name,
            Keys.IS_COMPUTED: True if self._data_balance_measures else False,
            Keys.COLS_OF_INTEREST: self._cols_of_interest,
            Keys.TARGET_COLUMN: self._target_column,
            Keys.POS_LABEL: self._pos_label,
            Keys.BACKEND: self._backend,
            Keys.CUSTOM_DATA_SPECIFIED: True if self._custom_data else False,
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

        # otherwise save the data needed to compute the measures at load time
        else:
            data_path = dir_manager.create_data_directory() / DATA_JSON
            if self._backend == SupportedBackend.SPARK:
                self._df.write.json(data_path)

            elif self._backend == SupportedBackend.PANDAS:
                with open(data_path, "w") as f:
                    f.write(self._df.to_json(orient="split"))

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

        all_db_dirs = DirectoryManager.list_sub_directories(path)
        if len(all_db_dirs) != 0:
            dir_manager = DirectoryManager(
                parent_directory_path=path, sub_directory_name=all_db_dirs[0]
            )

            config_dir = dir_manager.get_config_directory()

            with open(config_dir / MANAGER_JSON, "r") as f:
                manager_info = json.load(f)
                for k in [
                    Keys.COLS_OF_INTEREST,
                    Keys.TARGET_COLUMN,
                    Keys.POS_LABEL,
                    Keys.BACKEND,
                ]:
                    inst.__dict__[f"_{k}"] = manager_info[k]

            measures_path = config_dir / MEASURES_JSON

            # measures have been computed
            if measures_path.exists():
                with open(measures_path, "r") as f:
                    inst.__dict__["_data_balance_measures"] = json.load(f)

            # otherwise try to load the data and compute the measures
            else:
                data_path = dir_manager.get_data_directory() / DATA_JSON
                if data_path.exists():
                    df = None

                    # We use inst.__dict__.get("_backend") instead of
                    # inst._backend because it may not have been set yet.
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
                    inst.compute()

        return inst

    @staticmethod
    def _get_data_balance_measures(
        df: Union[pd.DataFrame, Any],
        cols_of_interest: List[str],
        target_column: str,
        pos_label: str,
        backend: str,
    ) -> Optional[Dict[str, Any]]:
        try:
            measures_dfs = DataBalanceManager._compute_measures(
                df=df,
                cols_of_interest=cols_of_interest,
                target_column=target_column,
                pos_label=pos_label,
                backend=backend,
            )
            feat_measures_df, dist_measures_df, agg_measures_df = measures_dfs

            unique_classes_feature_measures = (
                DataBalanceManager._transform_feature_measures(
                    df=feat_measures_df
                )
            )
            unique_classes, feature_measures = unique_classes_feature_measures

            distribution_measures = (
                DataBalanceManager._transform_distribution_measures(
                    df=dist_measures_df
                )
            )
            aggregate_measures = (
                DataBalanceManager._transform_aggregate_measures(
                    df=agg_measures_df
                )
            )

            return DataBalanceManager._transform_data_balance_measures(
                unique_classes=unique_classes,
                feature_measures=feature_measures,
                distribution_measures=distribution_measures,
                aggregate_measures=aggregate_measures,
            )
        except Exception as e:
            warnings.warn(f"Failed to get data balance measures due to {e!r}.")

    @staticmethod
    def _compute_measures(
        df: Union[pd.DataFrame, Any],
        cols_of_interest: List[str],
        target_column: str,
        pos_label: str,
        backend: str,
    ) -> Optional[Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]]:
        if backend == SupportedBackend.SPARK.value:
            try:
                return DataBalanceManager._compute_measures_spark(
                    df=df,
                    cols_of_interest=cols_of_interest,
                    target_column=target_column,
                    pos_label=pos_label,
                )
            except Exception as e:
                warnings.warn(
                    f"Failed to compute data balance with spark due to {e!r}.",
                )

        # If spark backend fails or backend != "spark", use pandas backend
        try:
            return DataBalanceManager._compute_measures_pandas(
                df=df,
                cols_of_interest=cols_of_interest,
                target_column=target_column,
                pos_label=pos_label,
            )
        except Exception as e:
            warnings.warn(
                f"Failed to compute data balance with pandas due to {e!r}.",
            )

    @staticmethod
    def _compute_measures_spark(
        df: Any,
        cols_of_interest: List[str],
        target_column: str,
        pos_label: str,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        # df is actually of type pyspark.sql.DataFrame
        # but we don't specify that type since pyspark may not be installed

        # We don't need to deepcopy the spark df because it's immutable
        if pos_label:
            df = df.withColumn(
                target_column,
                F.when(
                    F.col(target_column).contains(pos_label), F.lit(1)
                ).otherwise(F.lit(0)),
            )

        feature_measures: pd.DataFrame = (
            SparkDataBalance.FeatureBalanceMeasure()
            .setSensitiveCols(cols_of_interest)
            .setLabelCol(target_column)
            .transform(df)
            .select(FEATURE_NAME, CLASS_A, CLASS_B, SPARK_FEATURE_COL)
            .toPandas()
        )
        distribution_measures: pd.DataFrame = (
            SparkDataBalance.DistributionBalanceMeasure()
            .setSensitiveCols(cols_of_interest)
            .transform(df)
            .select(FEATURE_NAME, SPARK_DISTRIBUTION_COL)
            .toPandas()
        )
        aggregate_measures: pd.DataFrame = (
            SparkDataBalance.AggregateBalanceMeasure()
            .setSensitiveCols(cols_of_interest)
            .transform(df)
            .select(SPARK_AGGREGATE_COL)
            .toPandas()
        )

        return feature_measures, distribution_measures, aggregate_measures

    @staticmethod
    def _compute_measures_pandas(
        df: pd.DataFrame,
        cols_of_interest: List[str],
        target_column: str,
        pos_label: str,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        # We need to deepcopy the df otherwise original df will mutate
        df = df.copy(deep=True)

        if pos_label and pos_label in df[target_column].unique():
            df[target_column] = df[target_column].apply(
                lambda x: 1 if x == pos_label else 0
            )

        feature_measures: pd.DataFrame = FeatureBalanceMeasure(
            cols_of_interest, target_column
        ).measures(df)
        distribution_measures: pd.DataFrame = DistributionBalanceMeasure(
            cols_of_interest
        ).measures(df)
        aggregate_measures: pd.DataFrame = AggregateBalanceMeasure(
            cols_of_interest
        ).measures(df)

        return feature_measures, distribution_measures, aggregate_measures

    @staticmethod
    def _transform_feature_measures(
        df: pd.DataFrame,
    ) -> Tuple[Dict[str, List[str]], Dict[str, Dict[str, Dict[str, float]]]]:
        """
        Transform the feature balance measures df into a dictionary
        acceptable by the RAI dashboard
        """
        unique_classes: Dict[str, Set[str]] = {}
        feature_measures: Dict[str, Dict[str, Dict[str, float]]] = {}

        try:
            rows: List[Any] = df.reset_index(drop=True).to_dict(
                orient="records"
            )
            unique_classes: Dict[str, Set[str]] = {
                r[FEATURE_NAME]: set() for r in rows
            }
            feature_measures: Dict[str, Dict[str, Dict[str, float]]] = {
                r[FEATURE_NAME]: {} for r in rows
            }

            for row in rows:
                feature_name: str = row[FEATURE_NAME]
                class_a: str = row[CLASS_A]
                class_b: str = row[CLASS_B]
                class_key: str = f"{class_a}__{class_b}"

                unique_classes[feature_name].add(class_a)
                unique_classes[feature_name].add(class_b)

                del row[FEATURE_NAME], row[CLASS_A], row[CLASS_B]

                feature_measures[feature_name][class_key] = row

            unique_classes: Dict[str, List[str]] = {
                k: list(v) for k, v in unique_classes.items()
            }
        except Exception as e:
            warnings.warn(
                f"Failed to transform feature measures due to {e!r}."
            )

        return unique_classes, feature_measures

    @staticmethod
    def _transform_distribution_measures(
        df: pd.DataFrame,
    ) -> Dict[str, Dict[str, float]]:
        """
        Transform the distribution balance measures df into a dictionary
        acceptable by the RAI dashboard
        """
        distribution_measures: Dict[str, Dict[str, float]] = {}

        try:
            rows: List[Any] = df.reset_index(drop=True).to_dict(
                orient="records"
            )
            distribution_measures: Dict[str, Dict[str, float]] = {
                r[FEATURE_NAME]: r for r in rows
            }

            for measures in distribution_measures.values():
                del measures[FEATURE_NAME]
        except Exception as e:
            warnings.warn(
                f"Failed to transform distribution measures due to {e!r}.",
            )

        return distribution_measures

    @staticmethod
    def _transform_aggregate_measures(df: pd.DataFrame) -> Dict[str, float]:
        """
        Transform the aggregate balance measures df into a dictionary
        acceptable by the RAI dashboard
        """
        aggregate_measures: Dict[str, float] = {}

        try:
            aggregate_measures: Dict[str, float] = df.reset_index(
                drop=True
            ).to_dict(orient="records")[0]
        except Exception as e:
            warnings.warn(
                f"Failed to transform aggregate measures due to {e!r}."
            )

        return aggregate_measures

    @staticmethod
    def _transform_data_balance_measures(
        unique_classes,
        feature_measures,
        distribution_measures,
        aggregate_measures,
    ) -> Dict[str, Any]:
        """
        Transform all data balance measures into a dictionary
        acceptable by the RAI dashboard
        """
        data_balance_measures: Dict[str, Any] = {}

        try:
            data_balance_measures: Dict[str, Any] = {
                "distributionBalanceMeasures": {
                    "features": list(distribution_measures.keys()),
                    "measures": distribution_measures,
                },
                "featureBalanceMeasures": {
                    "features": list(feature_measures.keys()),
                    "uniqueClasses": unique_classes,
                    "measures": feature_measures,
                },
                "aggregateBalanceMeasures": {
                    "measures": aggregate_measures,
                },
            }
        except Exception as e:
            warnings.warn(
                f"Failed to transform all data balance measures due to {e!r}."
            )

        return data_balance_measures
