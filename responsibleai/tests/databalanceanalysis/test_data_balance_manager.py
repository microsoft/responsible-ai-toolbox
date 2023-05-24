# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
import pytest
from pandas.testing import assert_frame_equal

from responsibleai._interfaces import TaskType
from responsibleai.databalanceanalysis.data_balance_utils import (
    AGGREGATE_BALANCE_MEASURES_KEY, DISTRIBUTION_BALANCE_MEASURES_KEY,
    FEATURE_BALANCE_MEASURES_KEY)
from responsibleai.managers.data_balance_manager import DataBalanceManager
from responsibleai.rai_insights.rai_insights import RAIInsights


class TestDataBalanceManager:
    def test_init_with_valid_input(self, adult_data):
        train_df, test_df, _, target_col, classes = adult_data
        combined = pd.concat([train_df, test_df])

        # Try a combination of train only, test only, and both
        # Since fixtures are being used, easier not to use pytest.parametrize
        combinations = [(train_df, None), (None, test_df), (train_df, test_df)]
        for train, test in combinations:
            combined = pd.concat([train, test])
            manager = DataBalanceManager(
                train=train,
                test=test,
                target_column=target_col,
                classes=classes,
                task_type=TaskType.CLASSIFICATION,
            )
            assert manager._target_column == target_col
            assert manager._train is train
            assert manager._test is test
            assert_frame_equal(
                manager._df.reset_index(drop=True),
                combined.reset_index(drop=True),
            )

    def test_init_with_invalid_input(self):
        manager = DataBalanceManager(
            train=None,
            test=None,
            target_column=None,
            classes=None,
            task_type=None,
        )
        assert manager._target_column is None
        assert manager._classes is None
        assert manager._task_type is None
        assert manager._train is None
        assert manager._test is None
        assert manager._df is None

    @pytest.mark.parametrize("target_col", [None, ""])
    @pytest.mark.parametrize("cols_of_interest", [None, []])
    def test_add_errors_on_invalid_input_basic(
        self, adult_data, target_col, cols_of_interest
    ):
        train_df, test_df, _, _, classes = adult_data

        with pytest.raises(ValueError):
            manager = DataBalanceManager(
                train=train_df,
                test=test_df,
                target_column=target_col,
                classes=classes,
                task_type=TaskType.CLASSIFICATION,
            )
            manager.add(cols_of_interest=cols_of_interest)

    def test_add_errors_on_invalid_input_advanced(self, adult_data):
        train_df, test_df, categorical_cols, target_col, classes = adult_data

        # train and test not specified
        with pytest.raises(ValueError):
            manager = DataBalanceManager(
                train=None,
                test=None,
                target_column=target_col,
                classes=classes,
                task_type=TaskType.CLASSIFICATION,
            )
            manager.add(cols_of_interest=categorical_cols)

        # task_type is not classification
        with pytest.raises(ValueError):
            manager = DataBalanceManager(
                train=train_df,
                test=test_df,
                target_column=target_col,
                classes=classes,
                task_type=TaskType.REGRESSION,
            )
            manager.add(cols_of_interest=categorical_cols)

    def test_validate_with_valid_input(self, adult_data):
        train_df, test_df, categorical_cols, target_col, classes = adult_data
        manager = DataBalanceManager(
            train=train_df,
            test=test_df,
            target_column=target_col,
            classes=classes,
            task_type=TaskType.CLASSIFICATION,
        )
        manager._cols_of_interest = categorical_cols
        manager._validate()  # should not raise any exceptions

    @pytest.mark.parametrize("target_col", [None, ""])
    def test_validate_with_invalid_target_col(self, adult_data, target_col):
        train_df, test_df, _, _, classes = adult_data

        with pytest.raises(ValueError):
            manager = DataBalanceManager(
                train=train_df,
                test=test_df,
                target_column=target_col,
                classes=classes,
                task_type=TaskType.CLASSIFICATION,
            )
            manager._validate()

    @pytest.mark.parametrize("classes", [None, []])
    def test_validate_with_invalid_classes(self, adult_data, classes):
        train_df, test_df, _, target_col, _ = adult_data

        with pytest.raises(ValueError):
            manager = DataBalanceManager(
                train=train_df,
                test=test_df,
                target_column=target_col,
                classes=classes,
                task_type=TaskType.CLASSIFICATION,
            )
            manager._validate()

    def test_validate_with_invalid_input_advanced(self, adult_data):
        train, test, _, target_col, classes = adult_data
        # train and test not specified
        with pytest.raises(ValueError):
            manager = DataBalanceManager(
                train=None,
                test=None,
                target_column=target_col,
                classes=classes,
                task_type=TaskType.CLASSIFICATION,
            )
            manager._validate()

        # task_type is not classification
        with pytest.raises(ValueError):
            manager = DataBalanceManager(
                train=train,
                test=test,
                target_column=target_col,
                classes=classes,
                task_type=TaskType.REGRESSION,
            )
            manager._validate()

    def test_compute_transforms_and_sets_data_balance_measures(
        self, adult_data
    ):
        train_df, test_df, categorical_cols, target_col, classes = adult_data

        manager = DataBalanceManager(
            train=train_df,
            test=test_df,
            target_column=target_col,
            classes=classes,
            task_type=TaskType.CLASSIFICATION,
        )
        manager.add(cols_of_interest=categorical_cols)

        assert manager._data_balance_measures is None
        manager.compute()
        assert manager._data_balance_measures is not None

    def test_compute_with_col_less_than_two_unique_values(
        self, singular_valued_col_data
    ):
        # col1 has only one unique value, so we should get a warning per class
        # that feature balance measures weren't computed for this col
        cols_of_interest = ["col1", "col2"]
        target = "target"
        classes = [0, 1]

        manager = DataBalanceManager(
            train=singular_valued_col_data[:3],
            test=singular_valued_col_data[3:],
            target_column=target,
            classes=classes,
            task_type=TaskType.CLASSIFICATION,
        )
        manager.add(cols_of_interest=cols_of_interest)

        with pytest.warns(UserWarning) as warninfo:
            manager.compute()

        warns = {(warn.category, warn.message.args[0]) for warn in warninfo}

        warn_text = (f"Column '{cols_of_interest[0]}' has less than 2 unique"
                     f" values, so feature balance measures for {target}=="
                     "{pos_label} are not being computed for this column.")
        expected = {
            (UserWarning, warn_text.format(pos_label=classes[0])),
            (UserWarning, warn_text.format(pos_label=classes[1])),
        }
        for expected_warning in expected:
            assert expected_warning in warns

    def test_sets_data_balance_measures(
        self,
        adult_data_feature_balance_measures,
        adult_data_distribution_balance_measures,
        adult_data_aggregate_balance_measures,
    ):
        manager = DataBalanceManager(
            target_column=None,
            classes=None,
            train=None,
            test=None,
            task_type=None,
        )
        assert manager._data_balance_measures is None

        manager._set_data_balance_measures(
            adult_data_feature_balance_measures,
            adult_data_distribution_balance_measures,
            adult_data_aggregate_balance_measures,
        )
        assert manager._data_balance_measures is not None

        d = manager._data_balance_measures
        assert isinstance(d, dict)
        assert FEATURE_BALANCE_MEASURES_KEY in d
        assert DISTRIBUTION_BALANCE_MEASURES_KEY in d
        assert AGGREGATE_BALANCE_MEASURES_KEY in d

    def test_save_and_load_basic(self, tmpdir, adult_data):
        train_df, test_df, categorical_cols, target_col, classes = adult_data
        task_type = TaskType.CLASSIFICATION

        saved = DataBalanceManager(
            train=train_df,
            test=test_df,
            target_column=target_col,
            classes=classes,
            task_type=task_type,
        )
        assert saved._is_added is False

        save_dir = tmpdir.mkdir("save-dir")
        saved._save(save_dir)  # should not create any configs

        rai_insights = RAIInsights(
            model=None,
            train=train_df,
            test=test_df,
            target_column=target_col,
            task_type="classification",
            categorical_features=categorical_cols,
        )
        loaded = saved._load(save_dir, rai_insights)

        assert saved._target_column == loaded._target_column == target_col
        assert saved._classes == loaded._classes == list(map(str, classes))
        assert saved._task_type == loaded._task_type == task_type
        assert_frame_equal(saved._train, loaded._train)
        assert_frame_equal(saved._test, loaded._test)
        assert saved._is_added is loaded._is_added is False

        # All the instances variables from RAIInsights get set.
        assert_frame_equal(loaded._train, saved._train)
        assert_frame_equal(loaded._test, saved._test)
        assert loaded._target_column == saved._target_column
        # Also, df gets created using rai_insights.train and rai_insights.test
        assert_frame_equal(loaded._df, saved._df)

        # All the instance variables specific to the manager, such as
        # _cols_of_interest, don't get set.
        assert loaded._is_added is False
        assert loaded._cols_of_interest is None
        assert loaded._data_balance_measures is None

    def test_save_and_load_with_add(self, tmpdir, adult_data):
        train_df, test_df, categorical_cols, target_col, classes = adult_data
        task_type = TaskType.CLASSIFICATION

        saved = DataBalanceManager(
            train=train_df,
            test=test_df,
            target_column=target_col,
            classes=classes,
            task_type=task_type,
        )
        saved.add(cols_of_interest=categorical_cols)

        save_dir = tmpdir.mkdir("save-dir")
        saved._save(save_dir)

        rai_insights = RAIInsights(
            model=None,
            train=train_df,
            test=test_df,
            target_column=target_col,
            task_type="classification",
            categorical_features=categorical_cols,
        )
        loaded = saved._load(save_dir, rai_insights)

        assert saved._target_column == loaded._target_column == target_col
        assert saved._classes == loaded._classes == list(map(str, classes))
        assert saved._task_type == loaded._task_type == task_type
        assert_frame_equal(saved._train, loaded._train)
        assert_frame_equal(saved._test, loaded._test)
        assert saved._is_added is loaded._is_added is True
        assert_frame_equal(saved._df, loaded._df)

        assert saved._cols_of_interest == loaded._cols_of_interest

        # Populated in compute() so should be None
        assert (
            saved._data_balance_measures
            is loaded._data_balance_measures
            is None
        )

    def test_save_and_load_with_add_and_compute(self, tmpdir, adult_data):
        train_df, test_df, categorical_cols, target_col, classes = adult_data
        task_type = TaskType.CLASSIFICATION

        saved = DataBalanceManager(
            train=train_df,
            test=test_df,
            target_column=target_col,
            classes=classes,
            task_type=task_type,
        )
        saved.add(cols_of_interest=categorical_cols)
        saved.compute()

        save_dir = tmpdir.mkdir("save-dir")
        saved._save(save_dir)

        rai_insights = RAIInsights(
            model=None,
            train=train_df,
            test=test_df,
            target_column=target_col,
            task_type="classification",
            categorical_features=categorical_cols,
        )
        loaded = saved._load(save_dir, rai_insights)

        assert saved._target_column == loaded._target_column == target_col
        assert saved._classes == loaded._classes == list(map(str, classes))
        assert saved._task_type == loaded._task_type == task_type
        assert_frame_equal(saved._train, loaded._train)
        assert_frame_equal(saved._test, loaded._test)
        assert saved._is_added is loaded._is_added is True
        assert_frame_equal(saved._df, loaded._df)

        assert saved._cols_of_interest == loaded._cols_of_interest

        assert saved._data_balance_measures == loaded._data_balance_measures
