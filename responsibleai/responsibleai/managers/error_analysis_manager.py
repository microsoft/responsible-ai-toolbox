# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Error Analysis Manager class."""

import json
from pathlib import Path
from typing import Any, List, Optional

import jsonschema
import pandas as pd

from erroranalysis._internal.constants import metric_to_display_name
from erroranalysis._internal.error_analyzer import ModelAnalyzer
from erroranalysis._internal.error_report import as_error_report
from erroranalysis._internal.error_report import \
    json_converter as report_json_converter
from responsibleai._config.base_config import BaseConfig
from responsibleai._interfaces import ErrorAnalysisData
from responsibleai._internal.constants import ErrorAnalysisManagerKeys as Keys
from responsibleai._internal.constants import (FileFormats, ListProperties,
                                               ManagerNames)
from responsibleai._tools.shared.state_directory_management import \
    DirectoryManager
from responsibleai.exceptions import (ConfigAndResultMismatchException,
                                      DuplicateManagerConfigException,
                                      UserConfigValidationException)
from responsibleai.managers.base_manager import BaseManager

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


def get_wrapped_model(model, dropped_features):
    predict_proba_flag = hasattr(model, 'predict_proba')
    if predict_proba_flag:
        wrapper_model = MetadataRemovalClassificationModelWrapper(
            model,
            dropped_features)
    else:
        wrapper_model = MetadataRemovalRegressionModelWrapper(
            model,
            dropped_features)
    return wrapper_model


class MetadataRemovalClassificationModelWrapper():
    """Defines MetadataRemovalClassificationModelWrapper, wrapping the
    classification model to ignore dropped feature metadata if any."""

    def __init__(self, model: any,
                 dropped_features: Optional[List[str]] = None):
        """If needed, wraps the classification model to ignore the dropped features.

        :param model: The model or function to evaluate on the examples.
        :type model: function or model with a predict or predict_proba function
        :param dropped_features: List of features that were dropped by the
                                 the user during training of their model.
        :type dropped_features: Optional[List[str]]
        """
        self.model = model
        self.dropped_features = dropped_features

    def predict(self, dataset: pd.DataFrame):
        return self._apply_func(self.model.predict, dataset)

    def predict_proba(self, dataset: pd.DataFrame):
        return self._apply_func(self.model.predict_proba, dataset)

    def _apply_func(self, func, dataset):
        if self.dropped_features is None or len(self.dropped_features) == 0:
            return func(dataset)
        return func(dataset.drop(columns=self.dropped_features, axis=1))


class MetadataRemovalRegressionModelWrapper():
    """Defines MetadataRemovalRegressionModelWrapper, wrapping the
    regression model to ignore dropped feature metadata if any."""

    def __init__(self, model: any,
                 dropped_features: Optional[List[str]] = None):
        """If needed, wraps the model to ignore the dropped features.

        :param model: The model or function to evaluate on the examples.
        :type model: function or model with a predict function
        :param dropped_features: List of features that were dropped by the
                                 the user during training of their model.
        :type dropped_features: Optional[List[str]]
        """
        self.model = model
        self.dropped_features = dropped_features

    def predict(self, dataset: pd.DataFrame):
        if self.dropped_features is None or len(self.dropped_features) == 0:
            return self.model.predict(dataset)
        return self.model.predict(dataset.drop(
            columns=self.dropped_features, axis=1))


class ErrorAnalysisConfig(BaseConfig):
    """Defines the ErrorAnalysisConfig, specifying the parameters to run."""

    def __init__(self, max_depth: int, num_leaves: int,
                 min_child_samples: int, filter_features: List):
        """Creates an ErrorAnalysisConfig, specifying the parameters to run.

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
    """Defines the ErrorAnalysisManager for discovering errors in a model."""

    def __init__(self, model: Any, dataset: pd.DataFrame, target_column: str,
                 classes: Optional[List] = None,
                 categorical_features: Optional[List[str]] = None,
                 dropped_features: Optional[List[str]] = None):
        """Creates an ErrorAnalysisManager object.

        :param model: The model to analyze errors on.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param dataset: The dataset including the label column.
        :type dataset: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        :param classes: Class names as a list of strings.
            The order of the class names should match that of the model
            output.  Only required if analyzing a classifier.
        :type classes: list
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        :param dropped_features: List of features that are omitted for model
                            training. This includes metadata that is useful
                            for evaluating the model.
        :type dropped_features: Optional[List[str]]
        """
        self._true_y = dataset[target_column]
        self._dataset = dataset.drop(columns=[target_column])
        self._feature_names = list(self._dataset.columns)
        self._classes = classes
        self._categorical_features = categorical_features
        self._ea_config_list = []
        self._ea_report_list = []
        wrapper_model = get_wrapped_model(
            model,
            dropped_features)
        self._analyzer = ModelAnalyzer(
            wrapper_model,
            self._dataset,
            self._true_y,
            self._feature_names,
            self._categorical_features,
            classes=self._classes)

    def add(self, max_depth: int = 3, num_leaves: int = 31,
            min_child_samples: int = 20,
            filter_features: Optional[List] = None):
        """Add an error analyzer to be computed later.

        :param max_depth: The maximum depth of the tree.
        :type max_depth: Optional[int]
        :param num_leaves: The number of leaves in the tree.
        :type num_leaves: Optional[int]
        :param min_child_samples: The minimal number of data required to
            create one leaf.
        :type min_child_samples: Optional[int]
        :param filter_features: One or two features to use for the
            matrix filter.
        :type filter_features: Optional[list]
        """
        model_wrapper_without_metadata = self._analyzer.model
        if model_wrapper_without_metadata is None or \
                model_wrapper_without_metadata.model is None:
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
                num_leaves=num_leaves,
                compute_importances=True,
                compute_root_stats=True)

            # Validate the serialized output against schema
            schema = ErrorAnalysisManager._get_error_analysis_schema()
            jsonschema.validate(
                json.loads(report.to_json()), schema)

            self._ea_report_list.append(report)

    def get(self):
        """Get the computed error reports.

        Must be called after add and compute methods.

        :return: The computed error reports.
        :rtype: list[erroranalysis._internal.error_report.ErrorReport]
        """
        return self._ea_report_list

    @staticmethod
    def _get_error_analysis_schema():
        """Get the schema for validating the error analysis output."""
        schema_directory = (Path(__file__).parent.parent / '_tools' /
                            'error_analysis' / 'dashboard_schemas')
        schema_filename = f'error_analysis_output_v0.0{FileFormats.JSON}'
        schema_filepath = schema_directory / schema_filename
        with open(schema_filepath, 'r') as f:
            return json.load(f)

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
        report_props = zip(self.get(), self.list()[Keys.REPORTS])
        return [
            self._get_error_analysis(report,
                                     props) for report, props in report_props]

    def _get_error_analysis(self, report, props):
        error_analysis = ErrorAnalysisData()
        error_analysis.maxDepth = props[Keys.MAX_DEPTH]
        error_analysis.numLeaves = props[Keys.NUM_LEAVES]
        error_analysis.minChildSamples = props[Keys.MIN_CHILD_SAMPLES]
        error_analysis.tree = report.tree
        error_analysis.matrix = report.matrix
        error_analysis.importances = report.importances
        error_analysis.metric = metric_to_display_name[self._analyzer.metric]
        error_analysis.root_stats = report.root_stats
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

        if len(self._ea_config_list) != len(self._ea_report_list):
            raise ConfigAndResultMismatchException(
                "The number of error analysis configs {0} doesn't match the "
                "number of results {1}".format(
                    len(self._ea_config_list),
                    len(self._ea_report_list)
                )
            )

        for index in range(0, len(self._ea_report_list)):
            # save the configs
            directory_manager = DirectoryManager(parent_directory_path=path)
            config_path = (directory_manager.create_config_directory() /
                           f'config{FileFormats.JSON}')
            ea_config = self._ea_config_list[index]
            with open(config_path, 'w') as file:
                json.dump(ea_config, file,
                          default=config_json_converter)

            # save the reports
            report_path = (directory_manager.create_data_directory() /
                           f'report{FileFormats.JSON}')
            ea_report = self._ea_report_list[index]
            with open(report_path, 'w') as file:
                json.dump(ea_report, file,
                          default=report_json_converter)

    @staticmethod
    def _load(path, rai_insights):
        """Load the ErrorAnalysisManager from the given path.

        :param path: The directory path to load the ErrorAnalysisManager from.
        :type path: str
        :param rai_insights: The loaded parent RAIInsights.
        :type rai_insights: RAIInsights
        :return: The ErrorAnalysisManager manager after loading.
        :rtype: ErrorAnalysisManager
        """
        # create the ErrorAnalysisManager without any properties using
        # the __new__ function, similar to pickle
        inst = ErrorAnalysisManager.__new__(ErrorAnalysisManager)

        ea_config_list = []
        ea_report_list = []
        all_ea_dirs = DirectoryManager.list_sub_directories(path)
        for ea_dir in all_ea_dirs:
            directory_manager = DirectoryManager(
                parent_directory_path=path,
                sub_directory_name=ea_dir)

            config_path = (directory_manager.get_config_directory() /
                           f'config{FileFormats.JSON}')
            with open(config_path, 'r') as file:
                ea_config = json.load(file, object_hook=as_error_config)
                ea_config_list.append(ea_config)

            report_path = (directory_manager.get_data_directory() /
                           f'report{FileFormats.JSON}')
            with open(report_path, 'r') as file:
                ea_report = json.load(file, object_hook=as_error_report)
                # Validate the serialized output against schema
                schema = ErrorAnalysisManager._get_error_analysis_schema()
                jsonschema.validate(
                    json.loads(ea_report.to_json()), schema)
                ea_report_list.append(ea_report)

        inst.__dict__['_ea_report_list'] = ea_report_list
        inst.__dict__['_ea_config_list'] = ea_config_list

        categorical_features = rai_insights.categorical_features
        inst.__dict__['_categorical_features'] = categorical_features
        target_column = rai_insights.target_column
        true_y = rai_insights.test[target_column]
        dataset = rai_insights.test.drop(columns=[target_column])
        inst.__dict__['_dataset'] = dataset
        inst.__dict__['_true_y'] = true_y
        feature_names = list(dataset.columns)
        inst.__dict__['_feature_names'] = feature_names
        dropped_features = None
        if rai_insights._feature_metadata is not None:
            dropped_features = rai_insights._feature_metadata.dropped_features
        inst.__dict__['_dropped_features'] = dropped_features
        wrapper_model = get_wrapped_model(
            rai_insights.model,
            dropped_features)
        inst.__dict__['_analyzer'] = ModelAnalyzer(
            wrapper_model,
            dataset,
            true_y,
            feature_names,
            categorical_features)
        return inst
