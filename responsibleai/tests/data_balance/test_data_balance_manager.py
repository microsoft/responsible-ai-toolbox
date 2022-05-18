# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
from pandas.testing import assert_frame_equal
import pytest
from responsibleai._tools.data_balance.data_balance import (
    AGGREGATE_BALANCE_MEASURES_KEY,
    DISTRIBUTION_BALANCE_MEASURES_KEY,
    FEATURE_BALANCE_MEASURES_KEY,
)

from responsibleai.managers.data_balance_manager import DataBalanceManager
from responsibleai._tools.shared.backends import SupportedBackend
from responsibleai.rai_insights.rai_insights import RAIInsights


class TestDataBalanceManager:
    def test_init_with_valid_input(self, adult_data):
        train_df, test_df, _, target_col = adult_data
        combined = pd.concat([train_df, test_df])

        manager = DataBalanceManager(
            target_column=target_col, train=train_df, test=test_df
        )
        assert manager._target_column == target_col
        assert manager._train is train_df
        assert manager._test is test_df
        assert_frame_equal(
            manager._df.reset_index(drop=True), combined.reset_index(drop=True)
        )
        assert manager._backend == SupportedBackend.PANDAS

        manager = DataBalanceManager(
            target_column=None, train=train_df, test=None
        )
        assert manager._train is train_df
        assert manager._test is None
        assert_frame_equal(
            manager._df.reset_index(drop=True), train_df.reset_index(drop=True)
        )

        manager = DataBalanceManager(
            target_column=None, train=None, test=test_df
        )
        assert manager._train is None
        assert manager._test is test_df
        assert_frame_equal(
            manager._df.reset_index(drop=True), test_df.reset_index(drop=True)
        )

    def test_init_with_invalid_input(self):
        manager = DataBalanceManager(target_column=None, train=None, test=None)
        assert manager._target_column is None
        assert manager._train is None
        assert manager._test is None
        assert manager._df is None
        assert manager._backend is None

    def test_add_overrides_default_data_with_custom_data(
        self, adult_data, synthetic_data
    ):
        train_df, test_df, cols_of_interest, target_col = adult_data
        combined = pd.concat([train_df, test_df])

        manager = DataBalanceManager(
            target_column=target_col, train=train_df, test=test_df
        )
        assert_frame_equal(
            manager._df.reset_index(drop=True), combined.reset_index(drop=True)
        )
        assert manager._backend == SupportedBackend.PANDAS

        manager.add(
            cols_of_interest=cols_of_interest, custom_data=synthetic_data
        )
        assert_frame_equal(
            manager._df.reset_index(drop=True),
            synthetic_data.reset_index(drop=True),
        )
        assert manager._backend == SupportedBackend.PANDAS

    def test_add_warns_on_invalid_input(self, adult_data):
        train_df, test_df, cols_of_interest, target_col = adult_data

        # None target_column
        with pytest.warns():
            manager = DataBalanceManager(
                target_column=None, train=train_df, test=test_df
            )
            manager.add(cols_of_interest=cols_of_interest)

        # None cols_of_interest
        with pytest.warns():
            manager = DataBalanceManager(
                target_column=target_col, train=train_df, test=test_df
            )
            manager.add(cols_of_interest=None)

        # Empty cols_of_interest
        with pytest.warns():
            manager = DataBalanceManager(
                target_column=target_col, train=train_df, test=test_df
            )
            manager.add(cols_of_interest=[])

        # None train, None test, and None custom_data
        with pytest.warns():
            manager = DataBalanceManager(
                target_column=target_col, train=None, test=None
            )
            manager.add(cols_of_interest=cols_of_interest, custom_data=None)

    def test_validate_with_valid_input(self, adult_data):
        train_df, test_df, cols_of_interest, target_col = adult_data
        manager = DataBalanceManager(
            target_column=target_col, train=train_df, test=test_df
        )
        manager._cols_of_interest = cols_of_interest
        valid = manager._validate()
        assert valid

    def test_validate_with_invalid_input(self, adult_data):
        train_df, test_df, _, target_col = adult_data

        # None target_column
        with pytest.warns():
            manager = DataBalanceManager(
                target_column=None, train=train_df, test=test_df
            )
            valid = manager._validate()
            assert not valid

        # None train and None test
        with pytest.warns():
            manager = DataBalanceManager(
                target_column=target_col, train=None, test=None
            )
            valid = manager._validate()
            assert not valid

    def test_infer_backend_with_valid_input(self, adult_data):
        train_df, test_df, _, _ = adult_data
        manager = DataBalanceManager(
            target_column=None, train=train_df, test=test_df
        )
        assert manager._backend == SupportedBackend.PANDAS

    def test_infer_backend_with_invalid_input(self, adult_data):
        # None train and None test provided
        manager = DataBalanceManager(target_column=None, train=None, test=None)
        with pytest.raises(
            ValueError,
            match="Provided data is not a pandas or spark dataframe.",
        ):
            manager._infer_backend()

        # custom_data of type dict provided
        manager = DataBalanceManager(target_column=None, train=None, test=None)
        with pytest.raises(
            ValueError,
            match="Provided data is not a pandas or spark dataframe.",
        ):
            manager.add(cols_of_interest=None, custom_data={})

    def test_compute_applies_pos_label_on_default_data(self, adult_data):
        train_df, test_df, cols_of_interest, target_col = adult_data
        df = pd.concat([train_df, test_df])
        assert df[target_col].unique().tolist() == [0, 1]

        neg, pos = "<=50k", ">50k"
        df[target_col] = df[target_col].apply(lambda x: neg if x == 0 else pos)
        assert df[target_col].unique().tolist() == [neg, pos]

        manager = DataBalanceManager(
            target_column=target_col, train=train_df, test=test_df
        )
        manager.add(cols_of_interest=cols_of_interest, pos_label=pos)
        manager.compute()

        assert isinstance(manager._df, pd.DataFrame)
        assert manager._df[target_col].unique().tolist() == [0, 1]

    def test_compute_applies_pos_label_on_custom_data(
        self, synthetic_data, feature_1, feature_2, label
    ):
        assert synthetic_data[label].unique().tolist() == [0, 1]

        df = synthetic_data.copy(deep=True)
        neg, pos = "neg", "pos"
        df[label] = df[label].apply(lambda x: neg if x == 0 else pos)
        assert df[label].unique().tolist() == [neg, pos]

        manager = DataBalanceManager(
            target_column=label, train=None, test=None
        )
        manager.add(
            cols_of_interest=[feature_1, feature_2],
            pos_label=pos,
            custom_data=df,
        )
        manager.compute()

        assert isinstance(manager._df, pd.DataFrame)
        assert manager._df[label].unique().tolist() == [0, 1]

    def test_compute_transforms_and_sets_data_balance_measures(
        self, adult_data
    ):
        train_df, test_df, cols_of_interest, target_col = adult_data

        manager = DataBalanceManager(
            target_column=target_col, train=train_df, test=test_df
        )
        manager.add(cols_of_interest=cols_of_interest)

        assert manager._data_balance_measures is None
        manager.compute()
        assert manager._data_balance_measures is not None

    def test_sets_data_balance_measures(
        self,
        feature_balance_measures,
        distribution_balance_measures,
        aggregate_balance_measures,
    ):
        manager = DataBalanceManager(target_column=None, train=None, test=None)

        assert manager._data_balance_measures is None
        manager.set_data_balance_measures(
            feature_balance_measures=feature_balance_measures,
            distribution_balance_measures=distribution_balance_measures,
            aggregate_balance_measures=aggregate_balance_measures,
        )
        assert manager._data_balance_measures is not None

        d = manager._data_balance_measures
        assert isinstance(d, dict)
        assert FEATURE_BALANCE_MEASURES_KEY in d
        assert DISTRIBUTION_BALANCE_MEASURES_KEY in d
        assert AGGREGATE_BALANCE_MEASURES_KEY in d

    def test_save_and_load_basic(self, tmpdir, adult_data):
        train_df, test_df, _, target_col = adult_data
        saved = DataBalanceManager(
            target_column=target_col, train=train_df, test=test_df
        )

        save_dir = tmpdir.mkdir("save-dir")
        saved._save(save_dir)

        rai_insights = RAIInsights(
            model=None,
            train=train_df,
            test=test_df,
            target_column=target_col,
            task_type="classification",
        )
        loaded = saved._load(save_dir, rai_insights)

        assert saved._target_column == loaded._target_column == target_col
        assert_frame_equal(saved._train, loaded._train)
        assert_frame_equal(saved._test, loaded._test)
        assert_frame_equal(saved._df, loaded._df)
        assert saved._backend == loaded._backend == SupportedBackend.PANDAS

        # These are all populated in add() so they should all be None
        assert saved._cols_of_interest == loaded._cols_of_interest == None
        assert saved._pos_label == loaded._pos_label == None

        # These are all populated in compute() so they should all be None
        assert (
            saved._data_balance_measures
            == loaded._data_balance_measures
            == None
        )

    def test_save_and_load_with_add_on_default_data(self, tmpdir, adult_data):
        train_df, test_df, cols_of_interest, target_col = adult_data

        saved = DataBalanceManager(
            target_column=target_col, train=train_df, test=test_df
        )
        saved.add(cols_of_interest=cols_of_interest)

        save_dir = tmpdir.mkdir("save-dir")
        saved._save(save_dir)

        rai_insights = RAIInsights(
            model=None,
            train=train_df,
            test=test_df,
            target_column=target_col,
            task_type="classification",
        )
        loaded = saved._load(save_dir, rai_insights)

        assert saved._target_column == loaded._target_column == target_col
        assert_frame_equal(saved._train, loaded._train)
        assert_frame_equal(saved._test, loaded._test)
        assert_frame_equal(saved._df, loaded._df)
        assert saved._backend == loaded._backend == SupportedBackend.PANDAS

        assert saved._cols_of_interest == loaded._cols_of_interest
        assert saved._pos_label == loaded._pos_label

        # These are all populated in compute() so they should all be None
        assert (
            saved._data_balance_measures
            == loaded._data_balance_measures
            == None
        )

    def test_save_and_load_with_add_on_custom_data(
        self, tmpdir, adult_data, synthetic_data, feature_1, feature_2, label
    ):
        train_df, test_df, _, target_col = adult_data

        # Acts as the custom data passed into add()
        df = synthetic_data.copy(deep=True)
        neg, pos = "neg", "pos"
        df[label] = df[label].apply(lambda x: neg if x == 0 else pos)
        assert df[label].unique().tolist() == [neg, pos]

        saved = DataBalanceManager(
            target_column=target_col, train=train_df, test=test_df
        )
        saved.add(
            cols_of_interest=[feature_1, feature_2],
            pos_label=pos,
            custom_data=df,
            custom_data_target_column=label,
        )

        save_dir = tmpdir.mkdir("save-dir")
        saved._save(save_dir)

        rai_insights = RAIInsights(
            model=None,
            train=train_df,
            test=test_df,
            target_column=target_col,
            task_type="classification",
        )
        loaded = saved._load(save_dir, rai_insights)

        assert saved._target_column == loaded._target_column == label
        assert_frame_equal(saved._train, loaded._train)
        assert_frame_equal(saved._test, loaded._test)
        assert_frame_equal(saved._df, loaded._df)
        assert saved._backend == loaded._backend == SupportedBackend.PANDAS

        assert saved._cols_of_interest == loaded._cols_of_interest
        assert saved._pos_label == loaded._pos_label

        # These are all populated in compute() so they should all be None
        assert (
            saved._data_balance_measures
            == loaded._data_balance_measures
            == None
        )

    def test_save_and_load_with_add_and_compute_on_default_data(
        self, tmpdir, adult_data
    ):
        train_df, test_df, cols_of_interest, target_col = adult_data

        saved = DataBalanceManager(
            target_column=target_col, train=train_df, test=test_df
        )
        saved.add(cols_of_interest=cols_of_interest)
        saved.compute()

        save_dir = tmpdir.mkdir("save-dir")
        saved._save(save_dir)

        rai_insights = RAIInsights(
            model=None,
            train=train_df,
            test=test_df,
            target_column=target_col,
            task_type="classification",
        )
        loaded = saved._load(save_dir, rai_insights)

        assert saved._target_column == loaded._target_column == target_col
        assert_frame_equal(saved._train, loaded._train)
        assert_frame_equal(saved._test, loaded._test)
        assert_frame_equal(saved._df, loaded._df)
        assert saved._backend == loaded._backend == SupportedBackend.PANDAS

        assert saved._cols_of_interest == loaded._cols_of_interest
        assert saved._pos_label == loaded._pos_label

        assert saved._data_balance_measures == loaded._data_balance_measures

    def test_save_and_load_with_add_and_compute_on_custom_data(
        self, tmpdir, adult_data, synthetic_data, feature_1, feature_2, label
    ):
        train_df, test_df, _, target_col = adult_data

        # Acts as the custom data passed into add()
        df = synthetic_data.copy(deep=True)
        neg, pos = "neg", "pos"
        df[label] = df[label].apply(lambda x: neg if x == 0 else pos)
        assert df[label].unique().tolist() == [neg, pos]

        saved = DataBalanceManager(
            target_column=target_col, train=train_df, test=test_df
        )
        saved.add(
            cols_of_interest=[feature_1, feature_2],
            pos_label=pos,
            custom_data=df,
            custom_data_target_column=label,
        )
        saved.compute()

        save_dir = tmpdir.mkdir("save-dir")
        saved._save(save_dir)

        rai_insights = RAIInsights(
            model=None,
            train=train_df,
            test=test_df,
            target_column=target_col,
            task_type="classification",
        )
        loaded = saved._load(save_dir, rai_insights)

        assert saved._target_column == loaded._target_column == label
        assert_frame_equal(saved._train, loaded._train)
        assert_frame_equal(saved._test, loaded._test)
        assert_frame_equal(saved._df, loaded._df)
        assert saved._backend == loaded._backend == SupportedBackend.PANDAS

        assert saved._cols_of_interest == loaded._cols_of_interest
        assert saved._pos_label == loaded._pos_label

        assert saved._data_balance_measures == loaded._data_balance_measures
