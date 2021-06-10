# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Error Analysis Manager class."""

from pathlib import Path
import json
from responsibleai._internal.constants import (
    ManagerNames, ListProperties, ErrorAnalysisManagerKeys as Keys)
from responsibleai._managers.base_manager import BaseManager
from responsibleai._config.base_config import BaseConfig
from responsibleai.exceptions import DuplicateManagerConfigException
from erroranalysis._internal.error_analyzer import ModelAnalyzer
from erroranalysis._internal.error_report import (
    json_converter as report_json_converter, as_error_report)
from responsibleai._interfaces import ErrorAnalysisData

REPORTS = 'reports'
CONFIG = 'config'
MAX_DEPTH = Keys.MAX_DEPTH
NUM_LEAVES = Keys.NUM_LEAVES
FILTER_FEATURES = Keys.FILTER_FEATURES


def config_json_converter(obj):
    """Helper function to convert ErrorAnalysisConfig object to json.

    :param obj: Object to convert to json.
    :type obj: object
    :return: The converted json.
    :rtype: dict
    """
    if isinstance(obj, ErrorAnalysisConfig):
        return obj.__dict__
    try:
        return obj.to_json()
    except AttributeError:
        return obj.__dict__


def as_error_config(json_dict):
    """Helper function to convert json to an ErrorAnalysisConfig object.

    :param json_dict: The json to convert.
    :type json_dict: dict
    :return: The converted ErrorAnalysisConfig.
    :rtype: ErrorAnalysisConfig
    """
    has_max_depth = MAX_DEPTH in json_dict
    has_num_leaves = NUM_LEAVES in json_dict
    has_filter_features = FILTER_FEATURES in json_dict
    if has_max_depth and has_num_leaves and has_filter_features:
        max_depth = json_dict[MAX_DEPTH]
        num_leaves = json_dict[NUM_LEAVES]
        filter_features = json_dict[FILTER_FEATURES]
        return ErrorAnalysisConfig(max_depth, num_leaves, filter_features)
    else:
        return json_dict


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

    @property
    def __dict__(self):
        """Returns the dictionary representation of the ErrorAnalysisConfig.

        The dictionary contains the max depth, num leaves and list of
        matrix filter features.

        :return: The dictionary representation of the ErrorAnalysisConfig.
        :rtype: dict
        """
        return {'max_depth': self.max_depth,
                'num_leaves': self.num_leaves,
                'filter_features': self.filter_features}

    def to_json(self):
        """Serialize ErrorAnalysisConfig object to json.

        :return: The string json representation of the ErrorAnalysisConfig.
        :rtype: str
        """
        return json.dumps(self, default=config_json_converter, indent=2)

    @staticmethod
    def from_json(json_str):
        """Deserialize json string to an ErrorAnalysisConfig object.

        :return: The deserialized ErrorAnalysisConfig.
        :rtype: ErrorAnalysisConfig
        """
        return json.loads(json_str, object_hook=as_error_config)


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
        self.analyzer = ModelAnalyzer(self._model,
                                      self._train,
                                      self._y_train,
                                      self._feature_names,
                                      self._categorical_features)

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
                "config already added")
        else:
            self._ea_config_list.append(ea_config)

    def compute(self):
        """Creates an ErrorReport by running the error analyzer on the model.
        """
        for config in self._ea_config_list:
            if config.is_computed:
                continue
            config.is_computed = True
            max_depth = config.max_depth
            num_leaves = config.num_leaves
            report = self.analyzer.create_error_report(config.filter_features,
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
        """List information about the ErrorAnalysisManager.

        :return: A dictionary of properties.
        :rtype: dict
        """
        props = {ListProperties.MANAGER_TYPE: self.name}
        reports = []
        for config in self._ea_config_list:
            report = {}
            report[Keys.IS_COMPUTED] = config.is_computed
            report[Keys.MAX_DEPTH] = config.max_depth
            report[Keys.NUM_LEAVES] = config.num_leaves
            report[Keys.FILTER_FEATURES] = config.filter_features
            reports.append(report)
        props[Keys.REPORTS] = reports
        return props

    def get_data(self):
        """Get error analysis data

        :return: A array of ErrorAnalysisConfig.
        :rtype: List[ErrorAnalysisConfig]
        """
        return [
            self._get_error_analysis(i) for i in self.list()["reports"]]

    def _get_error_analysis(self, report):
        error_analysis = ErrorAnalysisData()
        error_analysis.maxDepth = report[Keys.MAX_DEPTH]
        error_analysis.numLeaves = report[Keys.NUM_LEAVES]
        return error_analysis

    @property
    def name(self):
        """Get the name of the error analysis manager.

        :return: The name of the error analysis manager.
        :rtype: str
        """
        return ManagerNames.ERROR_ANALYSIS

    def _save(self, path):
        """Save the ErrorAnalysisManager to the given path.

        :param path: The directory path to save the ErrorAnalysisManager to.
        :type path: str
        """
        top_dir = Path(path)
        top_dir.mkdir(parents=True, exist_ok=True)
        # save the reports
        reports_path = top_dir / REPORTS
        with open(reports_path, 'w') as file:
            json.dump(self._ea_report_list, file,
                      default=report_json_converter)
        # save the configs
        config_path = top_dir / CONFIG
        with open(config_path, 'w') as file:
            json.dump(self._ea_config_list, file,
                      default=config_json_converter)

    @staticmethod
    def _load(path, model_analysis):
        """Load the ErrorAnalysisManager from the given path.

        :param path: The directory path to load the ErrorAnalysisManager from.
        :type path: str
        :param model_analysis: The loaded parent ModelAnalysis.
        :type model_analysis: ModelAnalysis
        """
        # create the ErrorAnalysisManager without any properties using
        # the __new__ function, similar to pickle
        inst = ErrorAnalysisManager.__new__(ErrorAnalysisManager)
        top_dir = Path(path)
        reports_path = top_dir / REPORTS
        with open(reports_path, 'r') as file:
            ea_report_list = json.load(file, object_hook=as_error_report)
        inst.__dict__['_ea_report_list'] = ea_report_list
        config_path = top_dir / CONFIG
        with open(config_path, 'r') as file:
            ea_config_list = json.load(file, object_hook=as_error_config)
        inst.__dict__['_ea_config_list'] = ea_config_list
        inst.__dict__['_categorical_features'] = None
        target_column = model_analysis.target_column
        y_train = model_analysis.train[target_column]
        train = model_analysis.train.drop(columns=[target_column])
        inst.__dict__['_train'] = train
        inst.__dict__['_y_train'] = y_train
        inst.__dict__['_feature_names'] = list(train.columns)
        return inst
