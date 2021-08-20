# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Error Analysis Manager class."""

from pathlib import Path
import json

from responsibleai.exceptions import UserConfigValidationException
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
MIN_CHILD_SAMPLES = Keys.MIN_CHILD_SAMPLES
FILTER_FEATURES = Keys.FILTER_FEATURES
IS_COMPUTED = 'is_computed'


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
    has_min_child_samples = MIN_CHILD_SAMPLES in json_dict
    has_filter_features = FILTER_FEATURES in json_dict
    has_is_computed = IS_COMPUTED in json_dict
    has_all_fields = (has_max_depth and has_num_leaves and
                      has_min_child_samples and has_filter_features and
                      has_is_computed)
    if has_all_fields:
        max_depth = json_dict[MAX_DEPTH]
        num_leaves = json_dict[NUM_LEAVES]
        min_child_samples = json_dict[MIN_CHILD_SAMPLES]
        filter_features = json_dict[FILTER_FEATURES]
        config = ErrorAnalysisConfig(max_depth,
                                     num_leaves,
                                     min_child_samples,
                                     filter_features)
        config.is_computed = json_dict[IS_COMPUTED]
        return config
    else:
        return json_dict


class ErrorAnalysisConfig(BaseConfig):

    """Defines the ErrorAnalysisConfig, specifying the parameters to run.

    :param max_depth: The maximum depth of the tree.
    :type max_depth: int
    :param num_leaves: The number of leaves in the tree.
    :type num_leaves: int
    :param min_child_samples: The minimal number of data required to
        create one leaf.
    :type min_child_samples: int
    :param filter_features: One or two features to use for the
        matrix filter.
    :type filter_features: list
    """

    def __init__(self, max_depth, num_leaves,
                 min_child_samples, filter_features):
        """Defines the ErrorAnalysisConfig, specifying the parameters to run.

        :param max_depth: The maximum depth of the tree.
        :type max_depth: int
        :param num_leaves: The number of leaves in the tree.
        :type num_leaves: int
        :param min_child_samples: The minimal number of data required to
            create one leaf.
        :type min_child_samples: int
        :param filter_features: One or two features to use for the
            matrix filter.
        :type filter_features: list
        """
        super(ErrorAnalysisConfig, self).__init__()
        self.max_depth = max_depth
        self.num_leaves = num_leaves
        self.min_child_samples = min_child_samples
        self.filter_features = filter_features

    def __eq__(self, other_ea_config):
        """Returns true if this config is equal to the given config.

        :return: True if the given config is equal to the current config.
        :rtype: boolean
        """
        return (
            self.max_depth == other_ea_config.max_depth and
            self.num_leaves == other_ea_config.num_leaves and
            self.min_child_samples == other_ea_config.min_child_samples and
            self.filter_features == other_ea_config.filter_features
        )

    @property
    def __dict__(self):
        """Returns the dictionary representation of the ErrorAnalysisConfig.

        The dictionary contains the max depth, num leaves, min
        child samples and list of matrix filter features.

        :return: The dictionary representation of the ErrorAnalysisConfig.
        :rtype: dict
        """
        return {'max_depth': self.max_depth,
                'num_leaves': self.num_leaves,
                'min_child_samples': self.min_child_samples,
                'filter_features': self.filter_features,
                'is_computed': self.is_computed}

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
    :param dataset: The dataset including the label column.
    :type dataset: pandas.DataFrame
    :param target_column: The name of the label column.
    :type target_column: str
    """

    def __init__(self, model, dataset, target_column,
                 categorical_features=None):
        """Defines the ErrorAnalysisManager for discovering errors in a model.

        :param model: The model to analyze errors on.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param dataset: The dataset including the label column.
        :type dataset: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        """
        self._true_y = dataset[target_column]
        self._dataset = dataset.drop(columns=[target_column])
        self._feature_names = list(self._dataset.columns)
        self._categorical_features = categorical_features
        self._ea_config_list = []
        self._ea_report_list = []
        self._analyzer = ModelAnalyzer(model,
                                       self._dataset,
                                       self._true_y,
                                       self._feature_names,
                                       self._categorical_features)

    def add(self, max_depth=3, num_leaves=31,
            min_child_samples=20, filter_features=None):
        """Add an error analyzer to be computed later.

        :param max_depth: The maximum depth of the tree.
        :type max_depth: int
        :param num_leaves: The number of leaves in the tree.
        :type num_leaves: int
        :param min_child_samples: The minimal number of data required to
            create one leaf.
        :type min_child_samples: int
        :param filter_features: One or two features to use for the
            matrix filter.
        :type filter_features: list
        """
        if self._analyzer.model is None:
            raise UserConfigValidationException(
                'Model is required for error analysis')

        ea_config = ErrorAnalysisConfig(
            max_depth=max_depth,
            num_leaves=num_leaves,
            min_child_samples=min_child_samples,
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
            min_child_samples = config.min_child_samples
            filter_features = config.filter_features
            report = self._analyzer.create_error_report(
                filter_features, max_depth=max_depth,
                min_child_samples=min_child_samples,
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
            report[Keys.MIN_CHILD_SAMPLES] = config.min_child_samples
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
        error_analysis.minChildSamples = report[Keys.MIN_CHILD_SAMPLES]
        error_analysis.tree = self._analyzer.compute_error_tree(
            self._feature_names, None, None, error_analysis.maxDepth,
            error_analysis.numLeaves, error_analysis.minChildSamples)
        error_analysis.matrix = self._analyzer.compute_matrix(
            self._feature_names, None, None)
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
        categorical_features = model_analysis.categorical_features
        inst.__dict__['_categorical_features'] = categorical_features
        target_column = model_analysis.target_column
        true_y = model_analysis.test[target_column]
        dataset = model_analysis.test.drop(columns=[target_column])
        inst.__dict__['_dataset'] = dataset
        inst.__dict__['_true_y'] = true_y
        feature_names = list(dataset.columns)
        inst.__dict__['_feature_names'] = feature_names
        inst.__dict__['_analyzer'] = ModelAnalyzer(model_analysis.model,
                                                   dataset,
                                                   true_y,
                                                   feature_names,
                                                   categorical_features)
        return inst
