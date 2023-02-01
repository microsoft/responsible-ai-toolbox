# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Counterfactual Manager class."""
import json
import uuid
import warnings
from pathlib import Path
from typing import Any, List, Optional, Union

import dice_ml
import jsonschema
import numpy as np
import pandas as pd
from dice_ml import Dice
from dice_ml.counterfactual_explanations import CounterfactualExplanations
from dice_ml.explainer_interfaces.explainer_base import ExplainerBase

from responsibleai._config.base_config import BaseConfig
from responsibleai._data_validations import validate_train_test_categories
from responsibleai._interfaces import CounterfactualData
from responsibleai._internal.constants import (CounterfactualManagerKeys,
                                               FileFormats, ListProperties,
                                               ManagerNames)
from responsibleai._tools.shared.state_directory_management import \
    DirectoryManager
from responsibleai.exceptions import (DuplicateManagerConfigException,
                                      SchemaErrorException,
                                      UserConfigValidationException)
from responsibleai.managers.base_manager import BaseManager
from responsibleai.rai_insights.constants import ModelTask


class CounterfactualConstants:
    OPPOSITE = 'opposite'
    CLASSIFIER = 'classifier'
    REGRESSOR = 'regressor'
    SKLEARN = 'sklearn'
    RANDOM = 'random'


class _CommonSchemaConstants:
    LOCAL_IMPORTANCE = 'local_importance'
    METADATA = 'metadata'
    SUMMARY_IMPORTANCE = 'summary_importance'
    VERSION = 'version'


class _V1SchemaConstants:
    CF_EXAMPLES_LIST = 'cf_examples_list'
    LOCAL_IMPORTANCE = _CommonSchemaConstants.LOCAL_IMPORTANCE
    METADATA = _CommonSchemaConstants.METADATA
    SUMMARY_IMPORTANCE = _CommonSchemaConstants.SUMMARY_IMPORTANCE

    ALL = [CF_EXAMPLES_LIST, LOCAL_IMPORTANCE, METADATA, SUMMARY_IMPORTANCE]


class _V2SchemaConstants:
    CFS_LIST = 'cfs_list'
    DATA_INTERFACE = 'data_interface'
    DESIRED_CLASS = 'desired_class'
    DESIRED_RANGE = 'desired_range'
    FEATURE_NAMES = 'feature_names'
    FEATURE_NAMES_INCLUDING_TARGET = 'feature_names_including_target'
    LOCAL_IMPORTANCE = _CommonSchemaConstants.LOCAL_IMPORTANCE
    METADATA = _CommonSchemaConstants.METADATA
    MODEL_TYPE = 'model_type'
    SUMMARY_IMPORTANCE = _CommonSchemaConstants.SUMMARY_IMPORTANCE
    TEST_DATA = 'test_data'

    ALL = [CFS_LIST, DATA_INTERFACE, DESIRED_CLASS, DESIRED_RANGE,
           FEATURE_NAMES, FEATURE_NAMES_INCLUDING_TARGET,
           LOCAL_IMPORTANCE, METADATA, MODEL_TYPE,
           SUMMARY_IMPORTANCE, TEST_DATA]


class _SchemaVersions:
    V1 = '1.0'
    V2 = '2.0'

    ALL_VERSIONS = [V1, V2]


def _get_schema_version(counterfactuals_dict):
    """
    Get the version from the serialized version of the
    counterfactual examples.

    :param counterfactuals_dict: Serialized version of the
                                 counterfactual example.
    :type counterfactuals_dict: Dict
    """
    if _CommonSchemaConstants.METADATA not in counterfactuals_dict:
        raise SchemaErrorException(
            "No metadata field found in serialized counterfactual output"
        )

    metadata = counterfactuals_dict[_CommonSchemaConstants.METADATA]
    if _CommonSchemaConstants.VERSION not in metadata:
        raise SchemaErrorException(
            "No version field found in serialized counterfactual output"
        )

    version = metadata[_CommonSchemaConstants.VERSION]
    if version not in _SchemaVersions.ALL_VERSIONS:
        raise SchemaErrorException(
            "Schema version {0} not supported."
            "Support versions are {1}".format(
                version, ','.join(_SchemaVersions.ALL_VERSIONS)
            )
        )

    return version


class CounterfactualConfig(BaseConfig):
    """Defines the configuration for generating counterfactuals."""
    METHOD = 'method'
    CONTINUOUS_FEATURES = 'continuous_features'
    TOTAL_CFS = 'total_CFs'
    ID = 'id'
    DESIRED_RANGE = 'desired_range'
    DESIRED_CLASS = 'desired_class'
    PERMITTED_RANGE = 'permitted_range'
    FEATURES_TO_VARY = 'features_to_vary'
    FEATURE_IMPORTANCE = 'feature_importance'

    IS_COMPUTED = 'is_computed'
    COUNTERFACTUAL_OBJ = 'counterfactual_obj'
    HAS_COMPUTATION_FAILED = 'has_computation_failed'
    FAILURE_REASON = 'failure_reason'

    CONFIG_FILE_NAME = f'config{FileFormats.JSON}'
    RESULT_FILE_NAME = f'result{FileFormats.JSON}'
    EXPLAINER_FILE_NAME = f'explainer{FileFormats.PKL}'

    def __init__(self, method, continuous_features, total_CFs,
                 desired_class=CounterfactualConstants.OPPOSITE,
                 desired_range=None, permitted_range=None,
                 features_to_vary=None, feature_importance=False,
                 id=None):
        super(CounterfactualConfig, self).__init__()
        self.method = method
        self.continuous_features = continuous_features
        self.total_CFs = total_CFs
        if id is None:
            self.id = str(uuid.uuid4())
        else:
            self.id = id
        self.desired_range = desired_range
        self.desired_class = desired_class
        self.permitted_range = permitted_range
        self.features_to_vary = features_to_vary
        self.feature_importance = feature_importance
        self.is_computed = False
        self.counterfactual_obj = None
        self.has_computation_failed = False
        self.failure_reason = None
        self.explainer = None

    def __eq__(self, other_cf_config):
        return (
            self.method == other_cf_config.method and
            self.continuous_features == other_cf_config.continuous_features and
            self.total_CFs == other_cf_config.total_CFs and
            self.desired_range == other_cf_config.desired_range and
            self.desired_class == other_cf_config.desired_class and
            self.permitted_range == other_cf_config.permitted_range and
            self.features_to_vary == other_cf_config.features_to_vary and
            self.feature_importance == other_cf_config.feature_importance
        )

    def get_config_as_dict(self):
        """Returns the dictionary representation of configuration
           in the CounterfactualConfig.

        The dictionary contains the counterfactual method, continuous features,
        total counterfactuals, desired class, desired range,
        permitted range, features to vary and feature importance.

        :return: The dictionary representation of the CounterfactualConfig.
        :rtype: dict
        """
        return {
            CounterfactualConfig.METHOD: self.method,
            CounterfactualConfig.CONTINUOUS_FEATURES: self.continuous_features,
            CounterfactualConfig.TOTAL_CFS: self.total_CFs,
            CounterfactualConfig.ID: self.id,
            CounterfactualConfig.DESIRED_RANGE: self.desired_range,
            CounterfactualConfig.DESIRED_CLASS: self.desired_class,
            CounterfactualConfig.PERMITTED_RANGE: self.permitted_range,
            CounterfactualConfig.FEATURES_TO_VARY: self.features_to_vary,
            CounterfactualConfig.FEATURE_IMPORTANCE: self.feature_importance
        }

    def save_config(self, config_directory_path):
        config_file_path = (config_directory_path /
                            CounterfactualConfig.CONFIG_FILE_NAME)
        with open(config_file_path, 'w') as config_file:
            json.dump(
                self.get_config_as_dict(), config_file)

    @staticmethod
    def load_config(config_directory_path):
        config_path = (config_directory_path /
                       CounterfactualConfig.CONFIG_FILE_NAME)
        with open(config_path, 'r') as config_file:
            cf_config = json.load(config_file)

        counterfactual_config = CounterfactualConfig(
            method=cf_config[CounterfactualConfig.METHOD],
            continuous_features=cf_config[
                CounterfactualConfig.CONTINUOUS_FEATURES],
            total_CFs=cf_config[CounterfactualConfig.TOTAL_CFS],
            desired_class=cf_config[CounterfactualConfig.DESIRED_CLASS],
            desired_range=cf_config[CounterfactualConfig.DESIRED_RANGE],
            permitted_range=cf_config[
                CounterfactualConfig.PERMITTED_RANGE],
            features_to_vary=cf_config[
                CounterfactualConfig.FEATURES_TO_VARY],
            feature_importance=cf_config[
                CounterfactualConfig.FEATURE_IMPORTANCE],
            id=cf_config[CounterfactualConfig.ID])

        return counterfactual_config

    def get_result(self, include_counterfactual_obj=True):
        """Returns the dictionary representation of result of the computation
           in the CounterfactualConfig.

        :param include_counterfactual_obj: Whether to include serialized
                                           version of counterfactual object.
        :type method: bool
        :return: The dictionary representation of result in the
                 CounterfactualConfig.
        :rtype: dict
        """
        result = {}
        if include_counterfactual_obj:
            if self.counterfactual_obj is not None:
                result[CounterfactualConfig.COUNTERFACTUAL_OBJ] = \
                    self.counterfactual_obj.to_json()
            else:
                result[CounterfactualConfig.COUNTERFACTUAL_OBJ] = None

        result[CounterfactualConfig.HAS_COMPUTATION_FAILED] = \
            self.has_computation_failed
        result[CounterfactualConfig.FAILURE_REASON] = self.failure_reason
        result[CounterfactualConfig.IS_COMPUTED] = self.is_computed

        return result

    def save_result(self, data_directory_path):
        cf_result = self.get_result()
        if cf_result[CounterfactualConfig.COUNTERFACTUAL_OBJ] is not None:
            counterfactuals_dict = json.loads(
                cf_result[CounterfactualConfig.COUNTERFACTUAL_OBJ]
            )

            schema_version = _get_schema_version(counterfactuals_dict)
            if schema_version == _SchemaVersions.V1:
                cf_schema_keys = _V1SchemaConstants.ALL
            else:
                cf_schema_keys = _V2SchemaConstants.ALL

            for counterfactual_examples_key in cf_schema_keys:
                file_path = (data_directory_path /
                             (counterfactual_examples_key + FileFormats.JSON))
                with open(file_path, 'w') as file_path:
                    json.dump(
                        counterfactuals_dict[counterfactual_examples_key],
                        file_path)

        file_path = data_directory_path / (
            CounterfactualConfig.HAS_COMPUTATION_FAILED + FileFormats.JSON)
        with open(file_path, 'w') as file_path:
            json.dump(
                cf_result[CounterfactualConfig.HAS_COMPUTATION_FAILED],
                file_path)

        file_path = (data_directory_path /
                     (CounterfactualConfig.FAILURE_REASON + FileFormats.JSON))
        with open(file_path, 'w') as file_path:
            json.dump(
                cf_result[CounterfactualConfig.FAILURE_REASON],
                file_path)

        file_path = (data_directory_path /
                     (CounterfactualConfig.IS_COMPUTED + FileFormats.JSON))
        with open(file_path, 'w') as file_path:
            json.dump(
                cf_result[CounterfactualConfig.IS_COMPUTED],
                file_path)

    def load_result(self, data_directory_path):
        metadata_file_path = (
            data_directory_path /
            (_CommonSchemaConstants.METADATA + FileFormats.JSON))

        if metadata_file_path.exists():
            with open(metadata_file_path, 'r') as result_file:
                metadata = json.load(result_file)

            if metadata['version'] == _SchemaVersions.V1:
                cf_schema_keys = _V1SchemaConstants.ALL
            else:
                cf_schema_keys = _V2SchemaConstants.ALL

            counterfactual_examples_dict = {}
            for counterfactual_examples_key in cf_schema_keys:
                result_path = (
                    data_directory_path /
                    (counterfactual_examples_key + FileFormats.JSON))
                with open(result_path, 'r') as result_file:
                    counterfactual_examples_dict[
                        counterfactual_examples_key] = json.load(result_file)

            counterfactuals_json_str = json.dumps(counterfactual_examples_dict)
            self.counterfactual_obj = \
                CounterfactualExplanations.from_json(counterfactuals_json_str)
        else:
            self.counterfactual_obj = None

        result_path = (
            data_directory_path /
            (CounterfactualConfig.HAS_COMPUTATION_FAILED + FileFormats.JSON))
        with open(result_path, 'r') as result_file:
            self.has_computation_failed = json.load(result_file)

        result_path = (
            data_directory_path /
            (CounterfactualConfig.FAILURE_REASON + FileFormats.JSON))
        with open(result_path, 'r') as result_file:
            self.failure_reason = json.load(result_file)

        result_path = (
            data_directory_path /
            (CounterfactualConfig.IS_COMPUTED + FileFormats.JSON))
        with open(result_path, 'r') as result_file:
            self.is_computed = json.load(result_file)

    def save_explainer(self, explainer_directory_path):
        file_path = (explainer_directory_path /
                     CounterfactualConfig.EXPLAINER_FILE_NAME)
        try:
            self.explainer.serialize_explainer(file_path)
        except Exception:
            pass

    def load_explainer(self, explainer_directory_path):
        file_path = (explainer_directory_path /
                     CounterfactualConfig.EXPLAINER_FILE_NAME)
        try:
            self.explainer = ExplainerBase.deserialize_explainer(file_path)
        except Exception:
            pass


class CounterfactualManager(BaseManager):
    """Defines the CounterfactualManager for generating counterfactuals
        from a model.
    """
    _TRAIN = '_train'
    _TEST = '_test'
    _MODEL = '_model'
    _TARGET_COLUMN = '_target_column'
    _TASK_TYPE = '_task_type'
    _CATEGORICAL_FEATURES = '_categorical_features'
    _COUNTERFACTUAL_CONFIG_LIST = '_counterfactual_config_list'

    def __init__(self, model: Any, train: pd.DataFrame, test: pd.DataFrame,
                 target_column: str, task_type: str,
                 categorical_features: List[str]):
        """Creates a CounterfactualManager object.

        :param model: The model to generate counterfactuals from.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param initialization_examples: A matrix of feature vector
            examples (# examples x # features) for initializing the explainer.
        :type initialization_examples: pandas.DataFrame
        :param evaluation_examples: A matrix of feature vector
            examples (# examples x # features) on which to explain the
            model's output.
        :type evaluation_examples: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        :param task_type: Task type is either 'classification/regression'
        :type task_type: str
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        """
        self._model = model
        self._train = train
        self._test = test
        self._target_column = target_column
        self._task_type = task_type
        self._categorical_features = categorical_features
        self._counterfactual_config_list = []

    def _create_diceml_explainer(self, method, continuous_features):

        dice_data = dice_ml.Data(dataframe=self._train,
                                 continuous_features=continuous_features,
                                 outcome_name=self._target_column)
        model_type = (
            CounterfactualConstants.CLASSIFIER
            if self._task_type == ModelTask.CLASSIFICATION else
            CounterfactualConstants.REGRESSOR)
        dice_model = dice_ml.Model(model=self._model,
                                   backend=CounterfactualConstants.SKLEARN,
                                   model_type=model_type)

        dice_explainer = Dice(dice_data, dice_model, method=method)

        return dice_explainer

    def _add_counterfactual_config(self, new_counterfactual_config):
        if self._model is None:
            raise UserConfigValidationException(
                'Model is required for counterfactual example generation and '
                'feature importances')

        validate_train_test_categories(
            train_data=self._train,
            test_data=self._test,
            rai_compute_type='Counterfactual example generation',
            categoricals=self._categorical_features)

        to_vary = new_counterfactual_config.features_to_vary
        if to_vary != 'all':
            difference_set = set(to_vary) - set(self._train.columns)
            if len(difference_set) > 0:
                message = ("Feature names in features_to_vary do "
                           f"not exist in train data: {list(difference_set)}")
                raise UserConfigValidationException(message)

        if new_counterfactual_config.permitted_range is not None:
            permitted_features = \
                list(new_counterfactual_config.permitted_range)
            difference_set = set(permitted_features) - set(self._train.columns)
            if len(difference_set) > 0:
                message = ("Feature names in permitted_range do "
                           f"not exist in train data: {list(difference_set)}")
                raise UserConfigValidationException(message)

        if self._task_type == ModelTask.CLASSIFICATION:
            if new_counterfactual_config.desired_class is None:
                raise UserConfigValidationException(
                    'The desired_class attribute should be either \'{0}\''
                    ' for binary classification or the class value for '
                    'multi-classification scenarios.'.format(
                        CounterfactualConstants.OPPOSITE))

            is_multiclass = len(np.unique(
                self._train[self._target_column].values).tolist()) > 2
            if is_multiclass and \
                    new_counterfactual_config.desired_class == \
                    CounterfactualConstants.OPPOSITE:
                raise UserConfigValidationException(
                    'The desired_class attribute should not be \'{0}\''
                    ' It should be the class value for multiclass'
                    ' classification scenario.'.format(
                        CounterfactualConstants.OPPOSITE))

        if self._task_type == ModelTask.REGRESSION:
            if new_counterfactual_config.desired_range is None:
                raise UserConfigValidationException(
                    'The desired_range should not be None'
                    ' for regression scenarios.')

        if new_counterfactual_config.feature_importance and\
                new_counterfactual_config.total_CFs < 10:
            raise UserConfigValidationException(
                "A total_CFs value of at least 10 is required to "
                "use counterfactual feature importances. "
                "Either increase total_CFs to at least 10 or "
                "set feature_importance to False.")

        is_duplicate = new_counterfactual_config.is_duplicate(
            self._counterfactual_config_list)

        if is_duplicate:
            raise DuplicateManagerConfigException(
                'Duplicate counterfactual configuration detected.')
        else:
            self._counterfactual_config_list.append(new_counterfactual_config)

    def add(self,
            total_CFs: int,
            method: str = CounterfactualConstants.RANDOM,
            desired_class: Optional[Union[str, int]] = None,
            desired_range: Optional[List] = None,
            permitted_range: Optional[dict] = None,
            features_to_vary: Union[str, List[str]] = 'all',
            feature_importance: bool = True):
        """Add a counterfactual generation configuration to be computed later.

        :param total_CFs: Total number of counterfactuals required.
        :type total_CFs: int
        :param method: Type of dice-ml explainer. Either of "random", "genetic"
            or "kdtree".
        :type method: str
        :param desired_class: Desired counterfactual class. For binary
            classification, this needs to be set as "opposite".
        :type desired_class: string or int
        :param desired_range: For regression problems.
            Contains the outcome range to generate counterfactuals in.
        :type desired_range: list
        :param permitted_range: Dictionary with feature names as keys and
            permitted range in list as values. Defaults to the range inferred
            from training data.
        :type permitted_range: dict
        :param features_to_vary: Either a string "all" or a list of
            feature names to vary.
        :type features_to_vary: list
        :param feature_importance: Flag to compute feature importance using
            dice-ml.
        :type feature_importance: bool
        """
        if self._categorical_features is None:
            continuous_features = \
                list(set(self._train.columns) - set([self._target_column]))
        else:
            continuous_features = list(set(self._train.columns) -
                                       set([self._target_column]) -
                                       set(self._categorical_features))

        counterfactual_config = CounterfactualConfig(
            method=method,
            continuous_features=continuous_features,
            total_CFs=total_CFs,
            desired_class=desired_class,
            desired_range=desired_range,
            permitted_range=permitted_range,
            features_to_vary=features_to_vary,
            feature_importance=feature_importance)

        self._add_counterfactual_config(counterfactual_config)

    def compute(self):
        """Computes the counterfactual examples by running the counterfactual
           configuration."""
        for cf_config in self._counterfactual_config_list:
            if not cf_config.is_computed:
                cf_config.is_computed = True
                try:
                    cf_config.explainer = self._create_diceml_explainer(
                        method=cf_config.method,
                        continuous_features=cf_config.continuous_features)

                    X_test = self._test.drop([self._target_column], axis=1)

                    if not cf_config.feature_importance:
                        counterfactual_obj = \
                            cf_config.explainer.generate_counterfactuals(
                                X_test, total_CFs=cf_config.total_CFs,
                                desired_class=cf_config.desired_class,
                                desired_range=cf_config.desired_range,
                                features_to_vary=cf_config.features_to_vary,
                                permitted_range=cf_config.permitted_range)
                    else:
                        counterfactual_obj = \
                            cf_config.explainer.global_feature_importance(
                                X_test,
                                total_CFs=cf_config.total_CFs,
                                desired_class=cf_config.desired_class,
                                desired_range=cf_config.desired_range,
                                features_to_vary=cf_config.features_to_vary,
                                permitted_range=cf_config.permitted_range)

                    # Validate the serialized output against schema
                    schema = CounterfactualManager._get_counterfactual_schema(
                        version=counterfactual_obj.metadata['version'])
                    jsonschema.validate(
                        json.loads(counterfactual_obj.to_json()), schema)

                    cf_config.counterfactual_obj = counterfactual_obj

                except Exception as e:
                    cf_config.has_computation_failed = True
                    cf_config.failure_reason = str(e)
                    raise e

    def request_counterfactuals(self, query_id: str, data: Any):
        """Return the counterfactuals for a given point.

        :param query_id: The query id for finding the
                         counterfactual config.
        :type query_id: str
        :param data: The data point for which the counterfactuals
                     need to be generated.
        :type data: Any
        :return: An object of type CounterfactualData with
                 counterfactuals for the given data point.
        :rtype: CounterfactualData
        """
        if not isinstance(data, pd.DataFrame):
            raise UserConfigValidationException(
                'Data is of type {0} but it must be '
                'a pandas DataFrame.'.format(type(data)))

        if data.shape[0] > 1:
            raise UserConfigValidationException(
                'Only one row of data is allowed for '
                'counterfactual generation.')

        query_cf_config = None
        for cf_config in self._counterfactual_config_list:
            if cf_config.id == query_id:
                query_cf_config = cf_config
                break

        if query_cf_config is None:
            raise UserConfigValidationException(
                'No counterfactual config found for id {0}.'.format(
                    query_id))

        if not query_cf_config.feature_importance:
            counterfactual_obj = \
                query_cf_config.explainer.generate_counterfactuals(
                    data, total_CFs=query_cf_config.total_CFs,
                    desired_class=query_cf_config.desired_class,
                    desired_range=query_cf_config.desired_range,
                    features_to_vary=query_cf_config.features_to_vary,
                    permitted_range=query_cf_config.permitted_range)
        else:
            counterfactual_obj = \
                query_cf_config.explainer.local_feature_importance(
                    data,
                    total_CFs=query_cf_config.total_CFs,
                    desired_class=query_cf_config.desired_class,
                    desired_range=query_cf_config.desired_range,
                    features_to_vary=query_cf_config.features_to_vary,
                    permitted_range=query_cf_config.permitted_range)

        # Validate the serialized output against schema
        schema = CounterfactualManager._get_counterfactual_schema(
            version=counterfactual_obj.metadata['version'])
        jsonschema.validate(
            json.loads(counterfactual_obj.to_json()), schema)

        return self._get_counterfactual(query_cf_config, counterfactual_obj)

    def get(self, failed_to_compute=False):
        """Return the computed counterfactual examples objects or failure reason.

        :param failed_to_compute: Get the failure reasons if counterfactual
                                  examples failed to compute.
        :type failed_to_compute: Optional[bool]
        """
        if not failed_to_compute:
            counterfactual_obj_list = []
            for counterfactual_config in self._counterfactual_config_list:
                if counterfactual_config.is_computed and \
                        not counterfactual_config.has_computation_failed:
                    counterfactual_obj_list.append(
                        counterfactual_config.counterfactual_obj)
            return counterfactual_obj_list
        else:
            failure_reason_list = []
            for counterfactual_config in self._counterfactual_config_list:
                if counterfactual_config.is_computed and \
                        counterfactual_config.has_computation_failed:
                    failure_reason_list.append(
                        counterfactual_config.failure_reason)
            return failure_reason_list

    @staticmethod
    def _get_counterfactual_schema(version):
        """Get the schema for validating the counterfactual examples output."""
        schema_directory = (Path(__file__).parent.parent / '_tools' /
                            'counterfactual' / 'dashboard_schemas')
        schema_filename = f'counterfactual_examples_output_v{version}.json'
        schema_filepath = schema_directory / schema_filename
        with open(schema_filepath, 'r') as f:
            return json.load(f)

    def list(self):
        """List information about the CounterfactualManager.

        :return: A dictionary of properties.
        :rtype: dict
        """
        props = {ListProperties.MANAGER_TYPE: self.name}
        counterfactual_props_list = []
        for counterfactual_config in self._counterfactual_config_list:
            cf_coufig_dict = counterfactual_config.get_config_as_dict()
            cf_coufig_dict.update(counterfactual_config.get_result(
                include_counterfactual_obj=False))
            counterfactual_props_list.append(cf_coufig_dict)

        props[CounterfactualManagerKeys.COUNTERFACTUALS] = \
            counterfactual_props_list

        return props

    def get_data(self):
        """Get counterfactual data

        :return: A array of CounterfactualData.
        :rtype: List[CounterfactualData]
        """
        serialized_counterfactual_data_list = []
        for counterfactual_config in self._counterfactual_config_list:
            serialized_counterfactual_data_list.append(
                self._get_counterfactual(counterfactual_config))

        return serialized_counterfactual_data_list

    def _get_counterfactual(self, counterfactual_config,
                            counterfactual_object=None):
        cfdata = CounterfactualData()

        if counterfactual_object is None:
            json_data = json.loads(
                counterfactual_config.counterfactual_obj.to_json())
        else:
            json_data = json.loads(counterfactual_object.to_json())

        cfdata.cfs_list = json_data["cfs_list"]
        cfdata.feature_names = json_data["feature_names"]
        cfdata.feature_names_including_target = json_data[
            "feature_names_including_target"]
        cfdata.summary_importance = json_data["summary_importance"]
        cfdata.local_importance = json_data["local_importance"]
        cfdata.model_type = json_data["model_type"]
        cfdata.desired_class = json_data["desired_class"]
        cfdata.desired_range = json_data["desired_range"]
        cfdata.id = counterfactual_config.id
        cfdata.test_data = json_data["test_data"]
        return cfdata

    @property
    def name(self):
        """Get the name of the counterfactual manager.

        :return: The name of the counterfactual manager.
        :rtype: str
        """
        return ManagerNames.COUNTERFACTUAL

    def _save(self, path):
        """Save the CounterfactualManager to the given path.

        :param path: The directory path to save the CounterfactualManager to.
        :type path: str
        """
        counterfactual_dir = Path(path)
        counterfactual_dir.mkdir(parents=True, exist_ok=True)
        for counterfactual_config in self._counterfactual_config_list:
            directory_manager = DirectoryManager(parent_directory_path=path)

            counterfactual_config.save_config(
                directory_manager.create_config_directory()
            )

            counterfactual_config.save_result(
                directory_manager.create_data_directory()
            )

            counterfactual_config.save_explainer(
                directory_manager.create_generators_directory()
            )

    @staticmethod
    def _load(path, rai_insights):
        """Load the CounterfactualManager from the given path.

        :param path: The directory path to load the CounterfactualManager from.
        :type path: str
        :param rai_insights: The loaded parent RAIInsights.
        :type rai_insights: RAIInsights
        :return: The CounterfactualManager manager after loading.
        :rtype: CounterfactualManager
        """
        inst = CounterfactualManager.__new__(CounterfactualManager)

        # Rehydrate model analysis data
        inst.__dict__[CounterfactualManager._MODEL] = rai_insights.model
        inst.__dict__[CounterfactualManager._TRAIN] = rai_insights.train
        inst.__dict__[CounterfactualManager._TEST] = rai_insights.test
        inst.__dict__[CounterfactualManager._TARGET_COLUMN] = \
            rai_insights.target_column
        inst.__dict__[CounterfactualManager._TASK_TYPE] = \
            rai_insights.task_type
        inst.__dict__[CounterfactualManager._CATEGORICAL_FEATURES] = \
            rai_insights.categorical_features

        inst.__dict__[CounterfactualManager._COUNTERFACTUAL_CONFIG_LIST] = []

        # DirectoryManager.ensure_dir_exists(path)
        all_cf_dirs = DirectoryManager.list_sub_directories(path)
        for counterfactual_config_dir in all_cf_dirs:
            directory_manager = DirectoryManager(
                parent_directory_path=path,
                sub_directory_name=counterfactual_config_dir)

            counterfactual_config = CounterfactualConfig.load_config(
                directory_manager.get_config_directory()
            )

            counterfactual_config.load_result(
                directory_manager.get_data_directory()
            )

            counterfactual_config.load_explainer(
                directory_manager.get_generators_directory()
            )

            if counterfactual_config.explainer is None:
                explainer_load_err = (
                    'ERROR-LOADING-COUNTERFACTUAL-EXPLAINER: '
                    'There was an error loading the '
                    'counterfactual explainer model. '
                    'Retraining the counterfactual '
                    'explainer.')
                warnings.warn(explainer_load_err)
                counterfactual_config.explainer = \
                    inst._create_diceml_explainer(
                        counterfactual_config.method,
                        counterfactual_config.continuous_features)

            if counterfactual_config.counterfactual_obj is not None:
                # Validate the serialized output against schema
                schema = CounterfactualManager._get_counterfactual_schema(
                    version=counterfactual_config.counterfactual_obj.metadata[
                        'version'])
                jsonschema.validate(
                    json.loads(
                        counterfactual_config.counterfactual_obj.to_json()),
                    schema)

            inst.__dict__[
                CounterfactualManager._COUNTERFACTUAL_CONFIG_LIST].append(
                    counterfactual_config)

        return inst
