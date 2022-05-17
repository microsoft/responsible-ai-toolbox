# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for defining cohorts in raiwidgets package."""

import json
from typing import Any, List, Optional

import numpy as np
import pandas as pd

from responsibleai.exceptions import UserConfigValidationException


class CohortFilterMethods:
    """Defines different methods for cohort filters.
    """
    METHOD_GREATER = "greater"  # Strictly greater than a value
    # Greater than or equal to a value
    METHOD_GREATER_AND_EQUAL = "greater and equal"
    METHOD_LESS = "less"  # Strictly lesser than a value
    METHOD_LESS_AND_EQUAL = "less and equal"  # Lesser than or equal to a value
    METHOD_EQUAL = "equal"  # Equal to a value
    METHOD_INCLUDES = "includes"  # Includes a set of values
    METHOD_EXCLUDES = "excludes"  # Excludes a set of values
    METHOD_RANGE = "in the range of"  # In a given range of two values

    # List of all filter methods
    ALL = [METHOD_GREATER,
           METHOD_GREATER_AND_EQUAL,
           METHOD_LESS,
           METHOD_LESS_AND_EQUAL,
           METHOD_EQUAL,
           METHOD_INCLUDES,
           METHOD_EXCLUDES,
           METHOD_RANGE]

    # List of filter methods which expect a single value from the user
    SINGLE_VALUE_METHODS = [METHOD_GREATER_AND_EQUAL,
                            METHOD_GREATER,
                            METHOD_LESS_AND_EQUAL,
                            METHOD_LESS,
                            METHOD_EQUAL]


class ClassificationOutcomes:
    """Defines the possible values for classification outcomes.
    """
    FALSE_NEGATIVE = 'False negative'
    FALSE_POSITIVE = 'False positive'
    TRUE_NEGATIVE = 'True negative'
    TRUE_POSITIVE = 'True positive'

    ALL = [FALSE_NEGATIVE, FALSE_POSITIVE,
           TRUE_NEGATIVE, TRUE_POSITIVE]


def cohort_filter_json_converter(obj):
    """Helper function to convert CohortFilter object to json.
    :param obj: Object to convert to json.
    :type obj: object
    :return: The converted json.
    :rtype: dict
    """
    if isinstance(obj, CohortFilter):
        return obj.__dict__
    try:
        return obj.to_json()
    except AttributeError:
        return obj.__dict__


class CohortFilter:
    """Defines the cohort filter.
    :param method: Cohort filter method from one of CohortFilterMethods.
    :type method: str
    :param arg: List of values to be used by the cohort filter.
    :type arg: list
    :param column: The column name from the dataset on which the filter
                   will be applied.
    :type column: str
    """
    PREDICTED_Y = 'Predicted Y'
    TRUE_Y = 'True Y'
    INDEX = 'Index'
    CLASSIFICATION_OUTCOME = 'Classification outcome'
    REGRESSION_ERROR = 'Error'

    SPECIAL_COLUMN_LIST = [INDEX,
                           PREDICTED_Y,
                           TRUE_Y,
                           CLASSIFICATION_OUTCOME,
                           REGRESSION_ERROR]

    def __init__(self, method: str, arg: List[Any], column: str):
        """Defines the cohort filter.
        :param method: Cohort filter method from one of CohortFilterMethods.
        :type method: str
        :param arg: List of values to be used by the cohort filter.
        :type arg: list
        :param column: The column name from the dataset on which the filter
                       will be applied.
        :type column: str
        """
        self._validate_cohort_filter_parameters(
            method=method,
            arg=arg,
            column=column)

        self.method = method
        self.arg = arg
        self.column = column

    def __eq__(self, cohort_filter: Any):
        return self.method == cohort_filter.method and \
            self.arg == cohort_filter.arg and \
            self.column == cohort_filter.column

    def _validate_cohort_filter_parameters(
            self, method: str, arg: List[Any], column: str):
        """Validate the input values for the cohort filter.
        :param method: Cohort filter method from one of CohortFilterMethods.
        :type method: str
        :param arg: List of values to be used by the cohort filter.
        :type arg: list
        :param column: The column name from the dataset on which the filter
                       will be applied.
        :type column: str

        The following validations can be performed on the cohort filter:-

        1. Verify the correct types for method (expected string), column
           (expected string) and arg (expected list).
        2. The method value should be one of the filter string from
           CohortFilterMethods.ALL.
        3. The arg shouldn't be an empty list.
        4. For all cohort filter methods in
           CohortFilterMethods.SINGLE_VALUE_METHODS, the value in the arg
           should be integer or float and there should be only one value
           in arg.
        5. For cohort filter method CohortFilterMethods.METHOD_RANGE,
           the values in the arg should be integer or float and there
           should be only two values in arg.
        """
        if not isinstance(method, str):
            raise UserConfigValidationException(
                "Got unexpected type {0} for method. "
                "Expected string type.".format(type(method))
            )
        if method not in CohortFilterMethods.ALL:
            raise UserConfigValidationException(
                "Got unexpected value {0} for method. "
                "Expected either of {1}.".format(
                    method, " or ".join(CohortFilterMethods.ALL))
            )
        if not isinstance(column, str):
            raise UserConfigValidationException(
                "Got unexpected type {0} for column. "
                "Expected string type.".format(type(column))
            )
        if not isinstance(arg, list):
            raise UserConfigValidationException(
                "Got unexpected type {0} for arg. "
                "Expected list type.".format(type(arg))
            )
        if len(arg) == 0:
            raise UserConfigValidationException(
                "Empty list supplied for arg."
            )

        if method in CohortFilterMethods.SINGLE_VALUE_METHODS:
            if len(arg) != 1:
                raise UserConfigValidationException(
                    "Expected a single value in arg "
                    "for cohort methods {0}.".format(
                        " or ".join(CohortFilterMethods.SINGLE_VALUE_METHODS))
                )
            if not isinstance(arg[0], int) and not isinstance(arg[0], float):
                raise UserConfigValidationException(
                    "Expected int or float type for "
                    "arg with cohort methods {0}.".format(
                        " or ".join(CohortFilterMethods.SINGLE_VALUE_METHODS))
                )

        if method == CohortFilterMethods.METHOD_RANGE:
            if len(arg) != 2:
                raise UserConfigValidationException(
                    "Expected two entries in arg for "
                    "cohort method {0}.".format(
                        CohortFilterMethods.METHOD_RANGE)
                )
            if (not all(isinstance(entry, int) for entry in arg) and
                    not all(isinstance(entry, float) for entry in arg)):
                raise UserConfigValidationException(
                    "Expected int or float type for arg "
                    "with cohort method {0}.".format(
                        CohortFilterMethods.METHOD_RANGE)
                )

    def _validate_with_test_data(self, test_data: pd.DataFrame,
                                 target_column: str,
                                 categorical_features: List[str],
                                 is_classification: Optional[bool] = True):
        """
        Validate the cohort filters parameters with respect to test data.

        :param test_data: Test data over which cohort analysis will be done
            in ResponsibleAI Dashboard.
        :type test_data: pd.DataFrame
        :param target_column: The target column in the test data.
        :type target_column: str
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        :param is_classification: True to indicate if this validation needs
            to be done for a classification scenario and False to indicate
            that this needs to be done for regression scenario.
        :type is_classification: bool

        The following validations need to be performed for cohort filter with
        test data:-

        High level validations
        1. Validate if the filter column is present in the test data.
        2. Validate if the filter column is present in the special column
           list.

        "Index" Filter validations
        1. The Index filter only takes integer arguments.
        2. The Index filter doesn't take CohortFilterMethods.EXCLUDES
           filter method.

        "Classification outcome" Filter validations
        1. Validate that "Classification outcome" filter is not configure for
           multiclass classification and regression.
        2. The "Classification outcome" filter only contains values from set
           ClassificationOutcomes.
        3. The "Classification outcome" filter only takes
           CohortFilterMethods.INCLUDES filter method.

        "Error" Filter validations
        1. Validate that "Error" filter is not configure for
           multiclass classification and binary classification.
        2. Only integer or floating points can be configured as arguments.
        3. The CohortFilterMethods.INCLUDES and CohortFilterMethods.EXCLUDES
           filter methods cannot be configured for this filter.

        "Predicted Y/True Y" Filter validations
        1. The set of classes configured in case of classification is a
           superset of the classes available in the test data.
        2. The CohortFilterMethods.INCLUDES is only allowed to be
           configured for "Predicted Y" filter in case of classification.
        3. The CohortFilterMethods.INCLUDES and CohortFilterMethods.EXCLUDES
           filter methods cannot be configured for this filter for regression.

        "Dataset" Filter validations
        1. TODO:- For continuous features the allowed values that be configured
           should be within the range of minimum and maximum values available
           within the continuous feature column in the test data.
        2. For categorical features only CohortFilterMethods.INCLUDES can be
           configured.
        3. For categorical features the values allowed are a subset of the
           the values available in the categorical column in the test data.
        """
        # High level validations
        if self.column not in CohortFilter.SPECIAL_COLUMN_LIST and \
                (self.column not in
                    (set(test_data.columns) - set([target_column]))):
            raise UserConfigValidationException(
                "Unknown column {0} specified in cohort filter".format(
                    self.column)
            )

        if self.column == CohortFilter.INDEX:
            # "Index" Filter validations
            if self.method == CohortFilterMethods.METHOD_EXCLUDES:
                raise UserConfigValidationException(
                    "{0} filter is not supported with {1} based "
                    "selection.".format(
                        CohortFilterMethods.METHOD_EXCLUDES,
                        CohortFilter.INDEX)
                )

            if not all(isinstance(entry, int) for entry in self.arg):
                raise UserConfigValidationException(
                    "All entries in arg should be of type int."
                )
        elif self.column == CohortFilter.CLASSIFICATION_OUTCOME:
            # "Classification outcome" Filter validations
            is_multiclass = len(np.unique(
                test_data[target_column].values).tolist()) > 2

            if not is_classification or is_multiclass:
                raise UserConfigValidationException(
                    "{0} cannot be configured for multi-class classification"
                    " and regression scenarios.".format(
                        CohortFilter.CLASSIFICATION_OUTCOME)
                )

            if self.method != CohortFilterMethods.METHOD_INCLUDES:
                raise UserConfigValidationException(
                    "{0} can only be configured with "
                    "cohort filter {1}.".format(
                        CohortFilter.CLASSIFICATION_OUTCOME,
                        CohortFilterMethods.METHOD_INCLUDES)
                )

            for classification_outcome in self.arg:
                if classification_outcome not in ClassificationOutcomes.ALL:
                    raise UserConfigValidationException(
                        "{0} can only take argument values from {1}.".format(
                            CohortFilter.CLASSIFICATION_OUTCOME,
                            " or ".join(ClassificationOutcomes.ALL))
                    )
        elif self.column == CohortFilter.REGRESSION_ERROR:
            # "Error" Filter validations
            if is_classification:
                raise UserConfigValidationException(
                    "{0} cannot be configured for classification"
                    " scenarios.".format(CohortFilter.REGRESSION_ERROR)
                )

            if self.method == CohortFilterMethods.METHOD_INCLUDES or \
                    self.method == CohortFilterMethods.METHOD_EXCLUDES:
                raise UserConfigValidationException(
                    "{0} cannot be configured with either {1} or {2}.".format(
                        CohortFilter.REGRESSION_ERROR,
                        CohortFilterMethods.METHOD_INCLUDES,
                        CohortFilterMethods.METHOD_EXCLUDES
                    )
                )

            if not all(isinstance(entry, int) for entry in self.arg) and \
                    not all(isinstance(entry, float) for entry in self.arg):
                raise UserConfigValidationException(
                    "All entries in arg should be of type int or float"
                    " for {} cohort.".format(CohortFilter.REGRESSION_ERROR)
                )
        elif self.column == CohortFilter.PREDICTED_Y or \
                self.column == CohortFilter.TRUE_Y:
            # "Predicted Y/True Y" Filter validations
            if is_classification:
                if self.method != CohortFilterMethods.METHOD_INCLUDES:
                    raise UserConfigValidationException(
                        "{0} can only be configured with "
                        "filter {1} for classification".format(
                            self.column,
                            CohortFilterMethods.METHOD_INCLUDES)
                    )

                test_classes = np.unique(
                    test_data[target_column].values).tolist()

                if not all(entry in test_classes for entry in self.arg):
                    raise UserConfigValidationException(
                        "Found a class in arg which is not present in "
                        "test data")
            else:
                if self.method == CohortFilterMethods.METHOD_INCLUDES or \
                        self.method == CohortFilterMethods.METHOD_EXCLUDES:
                    raise UserConfigValidationException(
                        "{0} cannot be configured with "
                        "filter {1} for regression.".format(
                            self.column, self.method)
                    )
        else:
            # "Dataset" Filter validations
            if self.column in categorical_features:
                if self.method != CohortFilterMethods.METHOD_INCLUDES:
                    raise UserConfigValidationException(
                        "{0} is a categorical feature and should be only "
                        "configured with {1} cohort filter.".format(
                            self.column,
                            CohortFilterMethods.METHOD_INCLUDES)
                    )

                categories = np.unique(
                    test_data[self.column].values).tolist()

                for entry in self.arg:
                    if entry not in categories:
                        raise UserConfigValidationException(
                            "Found a category {0} in arg which is not present "
                            "in test data column {1}.".format(
                                entry, self.column)
                        )


class Cohort:
    """Defines the cohort which will be injected from SDK into the Dashboard.
    :param name: Name of the cohort.
    :type name: str
    """
    def __init__(self, name: str):
        """Defines the cohort which will be injected from SDK into the Dashboard.
        :param name: Name of the cohort.
        :type name: str
        """
        if not isinstance(name, str):
            raise UserConfigValidationException(
                "Got unexpected type {0} for cohort name. "
                "Expected string type.".format(type(name))
            )
        self.name = name
        self.cohort_filter_list = None

    def __eq__(self, cohort: Any):
        same_name = self.name == cohort.name
        if self.cohort_filter_list is None and \
                cohort.cohort_filter_list is None:
            return same_name
        elif self.cohort_filter_list is not None and \
                cohort.cohort_filter_list is None:
            return False
        elif self.cohort_filter_list is None and \
                cohort.cohort_filter_list is not None:
            return False

        same_num_cohort_filters = len(self.cohort_filter_list) == \
            len(cohort.cohort_filter_list)
        if not same_num_cohort_filters:
            return False

        same_cohort_filters = True
        for index in range(0, len(self.cohort_filter_list)):
            if self.cohort_filter_list[index] != \
                    cohort.cohort_filter_list[index]:
                same_cohort_filters = False
                break

        return same_name and same_cohort_filters

    @staticmethod
    def _cohort_serializer(obj):
        """The function to serialize the Cohort class object.

        :param obj: Any member of the Cohort class object.
        :type: Any
        :return: Python dictionary.
        :rtype: dict[Any, Any]
        """
        return obj.__dict__

    def to_json(self):
        """Returns a serialized JSON string for the Cohort object.

        :return: The JSON string for the cohort.
        :rtype: str
        """
        return json.dumps(self, default=Cohort._cohort_serializer)

    @staticmethod
    def _get_cohort_object(json_dict):
        """Method to read a JSON dictionary and return a Cohort object.

        :param json_dict: JSON dictionary containing cohort data.
        :type: dict[str, str]
        :return: The Cohort object.
        :rtype: Cohort
        """
        cohort_fields = ["name", "cohort_filter_list"]
        for cohort_field in cohort_fields:
            if cohort_field not in json_dict:
                raise UserConfigValidationException(
                    "No {0} field found for cohort deserialization".format(
                        cohort_field))

        if not isinstance(json_dict['cohort_filter_list'], list):
            raise UserConfigValidationException(
                "Field cohort_filter_list not of type list for "
                "cohort deserialization")

        deserialized_cohort = Cohort(json_dict['name'])
        for serialized_cohort_filter in json_dict['cohort_filter_list']:
            cohort_filter_fields = ["method", "arg", "column"]
            for cohort_filter_field in cohort_filter_fields:
                if cohort_filter_field not in serialized_cohort_filter:
                    raise UserConfigValidationException(
                        "No {0} field found for cohort filter "
                        "deserialization".format(cohort_filter_field))

            cohort_filter = CohortFilter(
                method=serialized_cohort_filter['method'],
                arg=serialized_cohort_filter['arg'],
                column=serialized_cohort_filter['column'])
            deserialized_cohort.add_cohort_filter(cohort_filter=cohort_filter)
        return deserialized_cohort

    @staticmethod
    def from_json(json_str):
        """Method to read a json string and return a Cohort object.

        :param json_str: Serialized JSON string.
        :type: str
        :return: The Cohort object.
        :rtype: Cohort
        """
        json_dict = json.loads(json_str)
        return Cohort._get_cohort_object(json_dict)

    def add_cohort_filter(self, cohort_filter: CohortFilter):
        """Add a cohort filter into the cohort.
        :param cohort_filter: Cohort filter defined by CohortFilter class.
        :type: CohortFilter
        """
        if not isinstance(cohort_filter, CohortFilter):
            raise UserConfigValidationException(
                "Got unexpected type {0} for cohort filter. "
                "Expected CohortFilter type.".format(type(cohort_filter))
            )
        if self.cohort_filter_list is None:
            self.cohort_filter_list = [cohort_filter]
        else:
            self.cohort_filter_list.append(cohort_filter)

    def _validate_with_test_data(self, test_data: pd.DataFrame,
                                 target_column: str,
                                 categorical_features: List[str],
                                 is_classification: Optional[bool] = True):
        """
        Validate the cohort and cohort filters parameters with respect to
        test data.

        :param test_data: Test data over which cohort analysis will be done
            in ResponsibleAI Dashboard.
        :type test_data: pd.DataFrame
        :param target_column: The target column in the test data.
        :type target_column: str
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        :param is_classification: True to indicate if this validation needs
            to be done for a classification scenario and False to indicate
            that this needs to be done for regression scenario.
        :type is_classification: bool
        """
        if self.cohort_filter_list is None:
            return
        if not isinstance(test_data, pd.DataFrame):
            raise UserConfigValidationException(
                "The test_data should be a pandas DataFrame.")
        if not isinstance(target_column, str):
            raise UserConfigValidationException(
                "The target_column should be string.")
        if not isinstance(categorical_features, list):
            raise UserConfigValidationException(
                "Expected a list type for categorical columns.")
        for categorical_feature in categorical_features:
            if not isinstance(categorical_feature, str):
                raise UserConfigValidationException(
                    "Feature {0} in categorical_features need to be of "
                    "string type.".format(categorical_feature)
                )

        if target_column not in test_data.columns:
            raise UserConfigValidationException(
                "The target_column {0} was not found in test_data.".format(
                    target_column)
            )

        test_data_columns_set = set(test_data.columns) - set([target_column])
        for categorical_feature in categorical_features:
            if categorical_feature not in test_data_columns_set:
                raise UserConfigValidationException(
                    "Found categorical feature {0} which is not"
                    " present in test data.".format(categorical_feature)
                )

        for cohort_filter in self.cohort_filter_list:
            cohort_filter._validate_with_test_data(
                test_data=test_data,
                target_column=target_column,
                categorical_features=categorical_features,
                is_classification=is_classification)
