# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json

import pandas as pd
import pytest

from raiwidgets.cohort import (ClassificationOutcomes, Cohort, CohortFilter,
                               CohortFilterMethods,
                               cohort_filter_json_converter)
from responsibleai.exceptions import UserConfigValidationException


def get_toy_binary_classification_dataset():
    return pd.DataFrame(data=[[23, 'X'], [25, 'Y']],
                        columns=["age", "target"])


def get_toy_multiclass_classification_dataset():
    return pd.DataFrame(
        data=[[23, 'X'], [25, 'Y'], [25, 'Z']],
        columns=["age", "target"])


def get_toy_regression_dataset():
    return pd.DataFrame(
        data=[[23, 2.5], [25, 3.6], [25, 4.6]],
        columns=["age", "target"])


class TestCohortFilter:
    def test_cohort_filter_validate_method(self):
        with pytest.raises(
                UserConfigValidationException,
                match="Got unexpected type <class 'int'> for method. "
                      "Expected string type."):
            CohortFilter(method=1,
                         arg=[], column=1)

        with pytest.raises(
                UserConfigValidationException,
                match="Got unexpected value random for method. "
                      "Expected either of greater or "
                      "greater and equal or "
                      "less or less and equal or "
                      "equal or includes or "
                      "excludes or in the range of."):
            CohortFilter(method="random", arg=[], column="random")

    def test_cohort_filter_validate_column(self):
        with pytest.raises(
                UserConfigValidationException,
                match="Got unexpected type <class 'int'> for column. "
                      "Expected string type."):
            CohortFilter(method=CohortFilterMethods.METHOD_GREATER,
                         arg=[], column=1)

    def test_cohort_filter_validate_arg(self):
        with pytest.raises(
                UserConfigValidationException,
                match="Got unexpected type <class 'int'> for arg. "
                      "Expected list type."):
            CohortFilter(method=CohortFilterMethods.METHOD_GREATER,
                         arg=1, column="age")

        with pytest.raises(
                UserConfigValidationException,
                match="Empty list supplied for arg."):
            CohortFilter(method=CohortFilterMethods.METHOD_GREATER,
                         arg=[], column="age")

    @pytest.mark.parametrize('method',
                             CohortFilterMethods.SINGLE_VALUE_METHODS)
    def test_cohort_filter_validate_single_value_methods_num_arg_entries(
            self, method):
        with pytest.raises(
                UserConfigValidationException,
                match="Expected a single value in arg "
                      "for cohort methods greater and "
                      "equal or greater or less and equal or less or equal."):
            CohortFilter(method=method, arg=[1, 9], column="age")

    @pytest.mark.parametrize('method',
                             CohortFilterMethods.SINGLE_VALUE_METHODS)
    def test_cohort_filter_validate_single_value_methods_type_arg_entries(
            self, method):
        with pytest.raises(
                UserConfigValidationException,
                match="Expected int or float type for arg "
                      "with cohort methods greater and "
                      "equal or greater or less and equal or less or equal."):
            CohortFilter(method=method, arg=["val"], column="age")

    def test_cohort_filter_validate_in_range_methods_num_arg_entries(
            self):
        with pytest.raises(
                UserConfigValidationException,
                match="Expected two entries in arg for "
                      "cohort method in the range of."):
            CohortFilter(method=CohortFilterMethods.METHOD_RANGE,
                         arg=[1], column="age")

    def test_cohort_filter_validate_in_range_methods_type_arg_entries(
            self):
        with pytest.raises(
                UserConfigValidationException,
                match="Expected int or float type for arg "
                      "with cohort method in the range of."):
            CohortFilter(method=CohortFilterMethods.METHOD_RANGE,
                         arg=[1, 'val'], column="age")

        with pytest.raises(
                UserConfigValidationException,
                match="Expected int or float type for arg "
                      "with cohort method in the range of."):
            CohortFilter(method=CohortFilterMethods.METHOD_RANGE,
                         arg=['val', 2], column="age")

    @pytest.mark.parametrize('method',
                             CohortFilterMethods.SINGLE_VALUE_METHODS)
    def test_cohort_filter_serialization_single_value_methods(self, method):
        cohort_filter_1 = CohortFilter(method=method,
                                       arg=[65.0], column='age')
        json_str = json.dumps(cohort_filter_1,
                              default=cohort_filter_json_converter)
        assert method in json_str
        assert '[65.0]' in json_str
        assert 'age' in json_str

    def test_cohort_filter_serialization_in_range_method(self):
        cohort_filter_1 = CohortFilter(
            method=CohortFilterMethods.METHOD_RANGE,
            arg=[65.0, 70.0], column='age')
        json_str = json.dumps(cohort_filter_1,
                              default=cohort_filter_json_converter)
        assert CohortFilterMethods.METHOD_RANGE in json_str
        assert '65.0' in json_str
        assert '70.0' in json_str
        assert 'age' in json_str

    @pytest.mark.parametrize('method',
                             [CohortFilterMethods.METHOD_INCLUDES,
                              CohortFilterMethods.METHOD_EXCLUDES])
    def test_cohort_filter_serialization_include_exclude_methods(self, method):
        cohort_filter_str = CohortFilter(method=method,
                                         arg=['val1', 'val2', 'val3'],
                                         column='age')
        json_str = json.dumps(cohort_filter_str,
                              default=cohort_filter_json_converter)
        assert method in json_str
        assert 'val1' in json_str
        assert 'val2' in json_str
        assert 'val3' in json_str
        assert 'age' in json_str

        cohort_filter_int = CohortFilter(method=method,
                                         arg=[1, 2, 3],
                                         column='age')
        json_str = json.dumps(cohort_filter_int,
                              default=cohort_filter_json_converter)
        assert method in json_str
        assert '1' in json_str
        assert '2' in json_str
        assert '3' in json_str
        assert 'age' in json_str


class TestCohortFilterDataValidations:
    def test_validate_with_test_data_high_level_validations(self):
        test_data = get_toy_binary_classification_dataset()

        cohort_filter_not_a_feature = CohortFilter(
            method=CohortFilterMethods.METHOD_LESS,
            arg=[65], column='fake_column')

        with pytest.raises(
                UserConfigValidationException,
                match="Unknown column fake_column specified in cohort filter"):
            cohort_filter_not_a_feature._validate_with_test_data(
                test_data=test_data, target_column="target",
                categorical_features=[])

    def test_validate_with_test_data_index_filter_validations(self):
        test_data = get_toy_binary_classification_dataset()

        cohort_filter_index_excludes = CohortFilter(
            method=CohortFilterMethods.METHOD_EXCLUDES,
            arg=[65], column=CohortFilter.INDEX)
        with pytest.raises(
                UserConfigValidationException,
                match="excludes filter is not supported with Index based "
                      "selection."):
            cohort_filter_index_excludes._validate_with_test_data(
                test_data=test_data, target_column="target",
                categorical_features=[]
            )

        cohort_filter_index_incorrect_args = CohortFilter(
            method=CohortFilterMethods.METHOD_GREATER,
            arg=[65.0], column=CohortFilter.INDEX)
        with pytest.raises(
                UserConfigValidationException,
                match="All entries in arg should be of type int."):
            cohort_filter_index_incorrect_args._validate_with_test_data(
                test_data=test_data, target_column="target",
                categorical_features=[]
            )

    def test_validate_with_test_data_classification_error_filter_validations(
            self):
        test_data_multiclass = get_toy_multiclass_classification_dataset()

        test_data_binary = get_toy_binary_classification_dataset()

        cohort_filter_classification_excludes = CohortFilter(
            method=CohortFilterMethods.METHOD_EXCLUDES,
            arg=[ClassificationOutcomes.FALSE_NEGATIVE],
            column=CohortFilter.CLASSIFICATION_OUTCOME)

        cohort_filter_classification_includes = CohortFilter(
            method=CohortFilterMethods.METHOD_INCLUDES,
            arg=["random"],
            column=CohortFilter.CLASSIFICATION_OUTCOME)

        with pytest.raises(
                UserConfigValidationException,
                match="Classification outcome cannot be "
                      "configured for multi-class classification"
                      " and regression scenarios."):
            cohort_filter_classification_excludes._validate_with_test_data(
                test_data=test_data_multiclass, target_column="target",
                categorical_features=[], is_classification=True
            )

        with pytest.raises(
                UserConfigValidationException,
                match="Classification outcome cannot be "
                      "configured for multi-class classification"
                      " and regression scenarios."):
            cohort_filter_classification_excludes._validate_with_test_data(
                test_data=test_data_binary, target_column="target",
                categorical_features=[], is_classification=False
            )

        with pytest.raises(
                UserConfigValidationException,
                match="Classification outcome can only be configured with "
                      "cohort filter includes."):
            cohort_filter_classification_excludes._validate_with_test_data(
                test_data=test_data_binary, target_column="target",
                categorical_features=[], is_classification=True
            )

        with pytest.raises(
                UserConfigValidationException,
                match="Classification outcome can only take argument values "
                      "from False negative or False positive or True "
                      "negative or True positive."):
            cohort_filter_classification_includes._validate_with_test_data(
                test_data=test_data_binary, target_column="target",
                categorical_features=[], is_classification=True)

    def test_validate_with_test_data_regression_error_filter_validations(
            self):
        test_data_regression = get_toy_regression_dataset()

        cohort_filter_regression = CohortFilter(
            method=CohortFilterMethods.METHOD_LESS,
            arg=[2.5],
            column=CohortFilter.REGRESSION_ERROR)

        with pytest.raises(
                UserConfigValidationException,
                match="Error cannot be configured for classification"
                      " scenarios."):
            cohort_filter_regression._validate_with_test_data(
                test_data=test_data_regression,
                target_column="target",
                categorical_features=[],
                is_classification=True)

        with pytest.raises(
                UserConfigValidationException,
                match="Error cannot be configured with either includes"
                      " or excludes."):
            cohort_filter_regression.method = \
                CohortFilterMethods.METHOD_INCLUDES
            cohort_filter_regression._validate_with_test_data(
                test_data=test_data_regression,
                target_column="target",
                categorical_features=[],
                is_classification=False)

        with pytest.raises(
                UserConfigValidationException,
                match="Error cannot be configured with either includes"
                      " or excludes."):
            cohort_filter_regression.method = \
                CohortFilterMethods.METHOD_EXCLUDES
            cohort_filter_regression._validate_with_test_data(
                test_data=test_data_regression,
                target_column="target",
                categorical_features=[],
                is_classification=False)

        with pytest.raises(
                UserConfigValidationException,
                match="All entries in arg should be of type int or float"
                      " for Error cohort."):
            cohort_filter_regression.method = \
                CohortFilterMethods.METHOD_GREATER
            cohort_filter_regression.arg = ['val1', 'val2']
            cohort_filter_regression._validate_with_test_data(
                test_data=test_data_regression,
                target_column="target",
                categorical_features=[],
                is_classification=False)

    @pytest.mark.parametrize('target_filter_type',
                             [CohortFilter.PREDICTED_Y,
                              CohortFilter.TRUE_Y])
    @pytest.mark.parametrize('method',
                             [CohortFilterMethods.METHOD_INCLUDES,
                              CohortFilterMethods.METHOD_EXCLUDES])
    def test_validate_with_test_data_regression_target_filter_validations(
            self, target_filter_type, method):
        test_data_regression = get_toy_regression_dataset()

        with pytest.raises(
                UserConfigValidationException,
                match="{0} cannot be configured with "
                      "filter {1} for regression.".format(target_filter_type,
                                                          method)):
            cohort_filter_regression = CohortFilter(
                method=method,
                arg=[2.5],
                column=target_filter_type)
            cohort_filter_regression._validate_with_test_data(
                test_data=test_data_regression,
                target_column="target",
                categorical_features=[],
                is_classification=False)

    @pytest.mark.parametrize('target_filter_type',
                             [CohortFilter.PREDICTED_Y,
                              CohortFilter.TRUE_Y])
    def test_validate_with_test_data_classification_target_filter_validations(
            self, target_filter_type):
        test_data_classification = get_toy_binary_classification_dataset()

        with pytest.raises(
                UserConfigValidationException,
                match="{0} can only be configured with "
                      "filter {1} for classification".format(
                          target_filter_type,
                          CohortFilterMethods.METHOD_INCLUDES)):
            cohort_filter_classification = CohortFilter(
                method=CohortFilterMethods.METHOD_EXCLUDES,
                arg=['X'],
                column=target_filter_type)
            cohort_filter_classification._validate_with_test_data(
                test_data=test_data_classification,
                target_column="target",
                categorical_features=[],
                is_classification=True)

        with pytest.raises(
            UserConfigValidationException,
            match="Found a class in arg which is not present in "
                  "test data"):
            cohort_filter_classification = CohortFilter(
                method=CohortFilterMethods.METHOD_INCLUDES,
                arg=['Z'],
                column=target_filter_type)
            cohort_filter_classification._validate_with_test_data(
                test_data=test_data_classification,
                target_column="target",
                categorical_features=[],
                is_classification=True)

    def test_validate_with_test_data_with_dataset_validations(
            self):
        test_data = pd.DataFrame(
            data=[[23, 'new', 'A'], [25, 'new, ''B'], [25, 'old', 'B']],
            columns=["age", 'type', "target"])

        with pytest.raises(
                UserConfigValidationException,
                match="{0} is a categorical feature and should be only "
                      "configured with {1} cohort filter.".format(
                          "type",
                          CohortFilterMethods.METHOD_INCLUDES)):
            cohort_filter = CohortFilter(
                method=CohortFilterMethods.METHOD_EXCLUDES,
                arg=['new'],
                column='type')
            cohort_filter._validate_with_test_data(
                test_data=test_data,
                target_column="target",
                categorical_features=['type'],
                is_classification=True)

        with pytest.raises(
                UserConfigValidationException,
                match="Found a category {0} in arg which is not present "
                      "in test data column {1}.".format('mid', 'type')):
            cohort_filter = CohortFilter(
                method=CohortFilterMethods.METHOD_INCLUDES,
                arg=['mid'],
                column='type')
            cohort_filter._validate_with_test_data(
                test_data=test_data,
                target_column="target",
                categorical_features=['type'],
                is_classification=True)


class TestCohort:
    def test_cohort_configuration_validations(self):
        with pytest.raises(
            UserConfigValidationException,
            match="Got unexpected type <class 'int'> for cohort name. "
                  "Expected string type."):
            Cohort(name=1)

        with pytest.raises(
            UserConfigValidationException,
            match="Got unexpected type <class 'list'> for cohort filter. "
                  "Expected CohortFilter type"):
            cohort = Cohort(name="Cohort New")
            cohort.add_cohort_filter(cohort_filter=[])

    def test_cohort_validate_with_test_data(self):
        cohort_filter_1 = CohortFilter(
            method=CohortFilterMethods.METHOD_LESS,
            arg=[65], column='age')
        cohort_1 = Cohort(name="Cohort New")
        cohort_1.add_cohort_filter(cohort_filter_1)
        test_data = get_toy_binary_classification_dataset()

        with pytest.raises(
                UserConfigValidationException,
                match="The test_data should be a pandas DataFrame"):
            cohort_1._validate_with_test_data(
                test_data=[], target_column='target',
                categorical_features=[])

        with pytest.raises(
                UserConfigValidationException,
                match="The target_column should be string."):
            cohort_1._validate_with_test_data(
                test_data=test_data,
                target_column=1,
                categorical_features=[])

        with pytest.raises(
                UserConfigValidationException,
                match="The target_column fake_target "
                      "was not found in test_data."):
            cohort_1._validate_with_test_data(
                test_data=test_data,
                target_column="fake_target",
                categorical_features=[])

        with pytest.raises(
                UserConfigValidationException,
                match="Expected a list type for "
                      "categorical columns."):
            cohort_1._validate_with_test_data(
                test_data=test_data,
                target_column="target",
                categorical_features={})

        with pytest.raises(
                UserConfigValidationException,
                match="Feature 1 in categorical_features need to be of "
                      "string type."):
            cohort_1._validate_with_test_data(
                test_data=test_data,
                target_column="target",
                categorical_features=[1, 2])

        with pytest.raises(
                UserConfigValidationException,
                match="Found categorical feature hours-per-week which is not"
                      " present in test data."):
            cohort_1._validate_with_test_data(
                test_data=test_data,
                target_column="target",
                categorical_features=["hours-per-week"])

    @pytest.mark.parametrize('method',
                             CohortFilterMethods.SINGLE_VALUE_METHODS)
    def test_cohort_serialization_single_value_method(self, method):
        cohort_filter_1 = CohortFilter(method=method,
                                       arg=[65], column='age')
        cohort_1 = Cohort(name="Cohort New")
        cohort_1.add_cohort_filter(cohort_filter_1)
        json_str = cohort_1.to_json()

        assert 'Cohort New' in json_str
        assert method in json_str
        assert '[65]' in json_str
        assert 'age' in json_str

    def test_cohort_serialization_deserialization_in_range_method(self):
        cohort_filter_1 = CohortFilter(
            method=CohortFilterMethods.METHOD_RANGE,
            arg=[65.0, 70.0], column='age')
        cohort_1 = Cohort(name="Cohort New")
        cohort_1.add_cohort_filter(cohort_filter_1)

        json_str = cohort_1.to_json()
        assert 'Cohort New' in json_str
        assert CohortFilterMethods.METHOD_RANGE in json_str
        assert '65.0' in json_str
        assert '70.0' in json_str
        assert 'age' in json_str

        cohort_1_new = Cohort.from_json(json_str)
        assert cohort_1_new.name == cohort_1.name
        assert len(cohort_1_new.cohort_filter_list) == \
            len(cohort_1.cohort_filter_list)
        assert cohort_1_new.cohort_filter_list[0].method == \
            cohort_1.cohort_filter_list[0].method

    @pytest.mark.parametrize('method',
                             [CohortFilterMethods.METHOD_INCLUDES,
                              CohortFilterMethods.METHOD_EXCLUDES])
    def test_cohort_serialization_deserialization_include_exclude_methods(
            self, method):
        cohort_filter_str = CohortFilter(method=method,
                                         arg=['val1', 'val2', 'val3'],
                                         column='age')
        cohort_str = Cohort(name="Cohort New Str")
        cohort_str.add_cohort_filter(cohort_filter_str)

        json_str = cohort_str.to_json()
        assert method in json_str
        assert 'val1' in json_str
        assert 'val2' in json_str
        assert 'val3' in json_str
        assert 'age' in json_str
        cohort_str_new = Cohort.from_json(json_str)
        assert cohort_str == cohort_str_new

        cohort_filter_int = CohortFilter(method=method,
                                         arg=[1, 2, 3],
                                         column='age')
        cohort_int = Cohort(name="Cohort New Int")
        cohort_int.add_cohort_filter(cohort_filter_int)

        json_str = cohort_int.to_json()
        assert method in json_str
        assert '1' in json_str
        assert '2' in json_str
        assert '3' in json_str
        assert 'age' in json_str

        cohort_int_new = Cohort.from_json(json_str)
        assert cohort_int == cohort_int_new

    def test_cohort_deserialization_error_conditions(self):
        test_dict = {}
        with pytest.raises(
                UserConfigValidationException,
                match="No name field found for cohort deserialization"):
            Cohort.from_json(json.dumps(test_dict))

        test_dict = {'name': 'Cohort New'}
        with pytest.raises(
                UserConfigValidationException,
                match="No cohort_filter_list field found for "
                      "cohort deserialization"):
            Cohort.from_json(json.dumps(test_dict))

        test_dict = {'name': 'Cohort New', 'cohort_filter_list': {}}
        with pytest.raises(UserConfigValidationException,
                           match="Field cohort_filter_list not of type list "
                                 "for cohort deserialization"):
            Cohort.from_json(json.dumps(test_dict))

        test_dict = {'name': 'Cohort New', 'cohort_filter_list': [{}]}
        with pytest.raises(
                UserConfigValidationException,
                match="No method field found for cohort filter "
                      "deserialization"):
            Cohort.from_json(json.dumps(test_dict))

        test_dict = {
            'name': 'Cohort New',
            'cohort_filter_list': [{"method": "fake_method"}]}
        with pytest.raises(
                UserConfigValidationException,
                match="No arg field found for cohort filter deserialization"):
            Cohort.from_json(json.dumps(test_dict))

        test_dict = {
            'name': 'Cohort New',
            'cohort_filter_list': [{"method": "fake_method", "arg": []}]}
        with pytest.raises(
                UserConfigValidationException,
                match="No column field found for cohort filter "
                      "deserialization"):
            Cohort.from_json(json.dumps(test_dict))


class TestCohortList:
    def test_cohort_list_serialization(self):
        cohort_filter_1 = CohortFilter(
            method=CohortFilterMethods.METHOD_LESS,
            arg=[65], column='age')
        cohort_1 = Cohort(name="Cohort New")
        cohort_1.add_cohort_filter(cohort_filter_1)

        cohort_2 = Cohort(name="Cohort Old")
        cohort_2.add_cohort_filter(cohort_filter_1)

        cohort_list = [cohort_1, cohort_2]
        json_str = json.dumps(cohort_list,
                              default=cohort_filter_json_converter)

        assert 'Cohort Old' in json_str
        assert 'Cohort New' in json_str
        assert CohortFilterMethods.METHOD_LESS in json_str
        assert '[65]' in json_str
        assert 'age' in json_str

    def test_empty_cohort_list_serialization(self):
        json_str = json.dumps(None, default=cohort_filter_json_converter)
        assert 'null' in json_str
