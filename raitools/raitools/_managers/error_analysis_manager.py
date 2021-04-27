# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Error Analysis Manager class."""

from raitools._internal.constants import ManagerNames
from raitools._managers.base_manager import BaseManager
from raitools._config.base_config import BaseConfig
from raitools.exceptions import DuplicateManagerConfigException
from erroranalysis._internal.error_analyzer import ModelAnalyzer


class ErrorAnalysisConfig(BaseConfig):

    """Defines the ErrorAnalysisConfig, specifying the parameters to run.

    :param max_depth: The maximum depth of the tree.
    :type max_depth: int
    :param num_leaves: The number of leaves in the tree.
    :type num_leaves: int
    :param filter_features: One or two features to use for the
        matrix filter.
    :type filter_features: list
    """

    def __init__(self, max_depth, num_leaves, filter_features):
        """Defines the ErrorAnalysisConfig, specifying the parameters to run.

        :param max_depth: The maximum depth of the tree.
        :type max_depth: int
        :param num_leaves: The number of leaves in the tree.
        :type num_leaves: int
        :param filter_features: One or two features to use for the
            matrix filter.
        :type filter_features: list
        """
        super(ErrorAnalysisConfig, self).__init__()
        self.max_depth = max_depth
        self.num_leaves = num_leaves
        self.filter_features = filter_features

    def __eq__(self, other_ea_config):
        """Returns true if this config is equal to the given config.

        :return: True if the given config is equal to the current config.
        :rtype: boolean
        """
        return (
            self.max_depth == other_ea_config.max_depth and
            self.num_leaves == other_ea_config.num_leaves and
            self.filter_features == other_ea_config.filter_features
        )


class ErrorAnalysisManager(BaseManager):

    """Defines the ErrorAnalysisManager for discovering errors in a model.

    :param model: The model to analyze errors on.
        A model that implements sklearn.predict or sklearn.predict_proba
        or function that accepts a 2d ndarray.
    :type model: object
    :param train: The training dataset including the label column.
    :type train: pandas.DataFrame
    :param target_column: The name of the label column.
    :type target_column: str
    """

    def __init__(self, model, train, target_column):
        """Defines the ErrorAnalysisManager for discovering errors in a model.

        :param model: The model to analyze errors on.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param train: The training dataset including the label column.
        :type train: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        """
        self._model = model
        self._y_train = train[target_column]
        self._train = train.drop(columns=[target_column])
        self._feature_names = list(self._train.columns)
        # TODO: Add categorical features support
        self._categorical_features = None
        self._ea_config_list = []
        self._ea_report_list = []

    def add(self, max_depth=3, num_leaves=31, filter_features=None):
        """Add an error analyzer to be computed later.

        :param max_depth: The maximum depth of the tree.
        :type max_depth: int
        :param num_leaves: The number of leaves in the tree.
        :type num_leaves: int
        :param filter_features: One or two features to use for the
            matrix filter.
        :type filter_features: list
        """
        ea_config = ErrorAnalysisConfig(
            max_depth=max_depth,
            num_leaves=num_leaves,
            filter_features=filter_features)
        is_duplicate = ea_config.is_duplicate(
            self._ea_config_list)

        if is_duplicate:
            raise DuplicateManagerConfigException(
                "Duplicate config specified for error analysis,"
                "onfig already added")
        else:
            self._ea_config_list.append(ea_config)

    def compute(self):
        """Creates an ErrorReport by running the error analyzer on the model.
        """
        for config in self._ea_config_list:
            if config.is_computed:
                continue
            config.is_computed = True
            analyzer = ModelAnalyzer(self._model,
                                     self._train,
                                     self._y_train,
                                     self._feature_names,
                                     self._categorical_features)
            max_depth = config.max_depth
            num_leaves = config.num_leaves
            report = analyzer.create_error_report(config.filter_features,
                                                  max_depth=max_depth,
                                                  num_leaves=num_leaves)
            self._ea_report_list.append(report)

    def get(self):
        """Get the computed error reports.

        Must be called after add and compute methods.

        :return: The computed error reports.
        :rtype: list[erroranalysis._internal.error_report.ErrorReport]
        """
        return self._ea_report_list

    def list(self):
        pass

    @property
    def name(self):
        """Get the name of the error analysis manager.

        :return: The name of the error analysis manager.
        :rtype: str
        """
        return ManagerNames.ERROR_ANALYSIS

    def _save(self, path):
        pass

    @staticmethod
    def _load(path, rai_analyzer):
        pass
