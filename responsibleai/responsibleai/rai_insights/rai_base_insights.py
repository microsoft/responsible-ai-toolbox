# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the RAIBaseInsights class."""

import json
import pickle
import warnings
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Optional

import pandas as pd

import responsibleai
from responsibleai._internal.constants import (FileFormats, Metadata,
                                               SerializationAttributes)

_DTYPES = 'dtypes'
_MODEL_PKL = Metadata.MODEL + FileFormats.PKL
_SERIALIZER = 'serializer'
_MANAGERS = 'managers'


class RAIBaseInsights(ABC):
    """Defines the base class RAIBaseInsights for the top-level API.

    This class is abstract and should not be instantiated.
    """

    def __init__(self, model: Optional[Any], train: pd.DataFrame,
                 test: pd.DataFrame, target_column: str, task_type: str,
                 serializer: Optional[Any] = None):
        """Creates an RAIBaseInsights object.

        :param model: The model to compute RAI insights for.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param train: The training dataset including the label column.
        :type train: pandas.DataFrame
        :param test: The test dataset including the label column.
        :type test: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        :param task_type: The task to run.
        :type task_type: str
        :param classes: The class labels in the training dataset
        :type classes: numpy.ndarray
        :param serializer: Picklable custom serializer with save and load
            methods for custom model serialization.
            The save method writes the model to file given a parent directory.
            The load method returns the deserialized model from the same
            parent directory.
        :type serializer: object
        """
        self.model = model
        self.train = train
        self.test = test
        self.target_column = target_column
        self.task_type = task_type
        self._serializer = serializer
        self._initialize_managers()

    @abstractmethod
    def _initialize_managers(self):
        """Initializes the managers.

        This method is abstract and should not be called.
        """
        pass

    @abstractmethod
    def _validate_rai_insights_input_parameters(self, *args):
        """Abstract method to validate the inputs for the constructor."""
        pass

    def compute(self):
        """Calls compute on each of the managers."""
        for manager in self._managers:
            manager.compute()

    def list(self):
        """List information about each of the managers.
        :return: Information about each of the managers.
        :rtype: dict
        """
        configs = {}
        for manager in self._managers:
            configs[manager.name] = manager.list()
        return configs

    def get(self):
        """List information about each of the managers.

        :return: Information about each of the managers.
        :rtype: dict
        """
        configs = {}
        for manager in self._managers:
            configs[manager.name] = manager.get()
        return configs

    @abstractmethod
    def get_data(self):
        """Get all data from RAIBaseInsights object."""
        pass

    @abstractmethod
    def _get_dataset(self):
        pass

    def _write_to_file(self, file_path, content):
        """Save the string content to the given file path.
        :param file_path: The file path to save the content to.
        :type file_path: str
        :param content: The string content to save.
        :type content: str
        """
        with open(file_path, 'w') as file:
            file.write(content)

    @abstractmethod
    def _save_predictions(self, path):
        """Save the predict() and predict_proba() output.

        :param path: The directory path to save the RAIBaseInsights to.
        :type path: str
        """
        pass

    def _save_data(self, path):
        """Save the copy of raw data (train and test sets) and
           their related metadata.

        :param path: The directory path to save the RAIBaseInsights to.
        :type path: str
        """
        data_directory = Path(path) / SerializationAttributes.DATA_DIRECTORY
        data_directory.mkdir(parents=True, exist_ok=True)
        dtypes = self.train.dtypes.astype(str).to_dict()
        self._write_to_file(data_directory /
                            (Metadata.TRAIN + _DTYPES + FileFormats.JSON),
                            json.dumps(dtypes))
        self._write_to_file(data_directory /
                            (Metadata.TRAIN + FileFormats.JSON),
                            self.train.to_json(orient='split'))

        dtypes = self.test.dtypes.astype(str).to_dict()
        self._write_to_file(data_directory /
                            (Metadata.TEST + _DTYPES + FileFormats.JSON),
                            json.dumps(dtypes))
        self._write_to_file(data_directory /
                            (Metadata.TEST + FileFormats.JSON),
                            self.test.to_json(orient='split'))

        self._write_to_file(Path(path) /
                            (SerializationAttributes.RAI_VERSION_JSON),
                            json.dumps(
                                {"responsibleai": responsibleai.__version__}))

    @abstractmethod
    def _save_metadata(self, path):
        """Save the metadata like target column, categorical features,
           task type and the classes (if any).

        :param path: The directory path to save the RAIBaseInsights to.
        :type path: str
        """
        pass

    def _save_model(self, path):
        """Save the model and the serializer (if any).

        :param path: The directory path to save the RAIBaseInsights to.
        :type path: str
        """
        top_dir = Path(path)
        if self._serializer is not None:
            # save the model
            self._serializer.save(self.model, top_dir)
            # save the serializer
            with open(top_dir / _SERIALIZER, 'wb') as file:
                pickle.dump(self._serializer, file)
        else:
            if self.model is not None:
                has_setstate = hasattr(self.model, '__setstate__')
                has_getstate = hasattr(self.model, '__getstate__')
                if not (has_setstate and has_getstate):
                    raise ValueError(
                        "Model must be picklable or a custom serializer must"
                        " be specified")
            with open(top_dir / _MODEL_PKL, 'wb') as file:
                pickle.dump(self.model, file)

    def _save_managers(self, path):
        """Save the state of individual managers.

        :param path: The directory path to save the RAIBaseInsights to.
        :type path: str
        """
        top_dir = Path(path)
        # save each of the individual managers
        for manager in self._managers:
            manager._save(top_dir / manager.name)

    def save(self, path):
        """Save the RAIBaseInsights to the given path.

        :param path: The directory path to save the RAIBaseInsights to.
        :type path: str
        """
        self._save_managers(path)
        self._save_data(path)
        self._save_metadata(path)
        self._save_model(path)
        self._save_predictions(path)

    @staticmethod
    def _load_data(inst, path):
        """Load the raw data (train and test sets).

        :param inst: RAIBaseInsights object instance.
        :type inst: RAIBaseInsights
        :param path: The directory path to data location.
        :type path: str
        """
        data_directory = Path(path) / SerializationAttributes.DATA_DIRECTORY
        with open(data_directory /
                  (Metadata.TRAIN + _DTYPES + FileFormats.JSON), 'r') as file:
            types = json.load(file)
        with open(data_directory / (Metadata.TRAIN + FileFormats.JSON),
                  'r') as file:
            train = pd.read_json(file, dtype=types, orient='split')
        inst.__dict__[Metadata.TRAIN] = train
        with open(data_directory /
                  (Metadata.TEST + _DTYPES + FileFormats.JSON), 'r') as file:
            types = json.load(file)
        with open(data_directory / (Metadata.TEST + FileFormats.JSON),
                  'r') as file:
            test = pd.read_json(file, dtype=types, orient='split')
        inst.__dict__[Metadata.TEST] = test

    @staticmethod
    def _load_model(inst, path):
        """Load the model.

        :param inst: RAIBaseInsights object instance.
        :type inst: RAIBaseInsights
        :param path: The directory path to model location.
        :type path: str
        """
        top_dir = Path(path)
        serializer_path = top_dir / _SERIALIZER
        model_load_err = ('ERROR-LOADING-USER-MODEL: '
                          'There was an error loading the user model.')
        if serializer_path.exists():
            try:
                with open(serializer_path, 'rb') as file:
                    serializer = pickle.load(file)
                inst.__dict__['_' + _SERIALIZER] = serializer
                inst.__dict__[Metadata.MODEL] = serializer.load(top_dir)
            except Exception as e:
                warnings.warn(model_load_err)
                raise e
        else:
            inst.__dict__['_' + _SERIALIZER] = None
            try:
                with open(top_dir / _MODEL_PKL, 'rb') as file:
                    inst.__dict__[Metadata.MODEL] = pickle.load(file)
            except Exception as e:
                warnings.warn(model_load_err)
                raise e

    @staticmethod
    def _load_managers(inst, path, manager_map):
        """Load the specified managers from the given path.

        :param inst: RAIBaseInsights object instance.
        :type inst: RAIBaseInsights
        :param path: The directory path to the location of
            the serialized managers.
        :type path: str
        :param manager_map: The map of manager names to manager classes.
        :type manager_map: dict
        """
        top_dir = Path(path)
        managers = []
        for manager_name, manager_class in manager_map.items():
            full_name = f'_{manager_name}_manager'
            manager_dir = top_dir / manager_name
            manager = manager_class._load(manager_dir, inst)
            inst.__dict__[full_name] = manager
            managers.append(manager)

        inst.__dict__['_' + _MANAGERS] = managers

    @staticmethod
    def _load(path, inst, manager_map, load_metadata_func):
        """Load the RAIBaseInsights from the given path.

        :param path: The directory path to load the RAIBaseInsights from.
        :type path: str
        :param inst: RAIBaseInsights object instance.
        :type inst: RAIBaseInsights
        :param manager_map: The map of manager names to manager classes.
        :type manager_map: dict
        :param load_metadata_func: The function to load the metadata.
        :type load_metadata_func: function
        :return: The RAIBaseInsights object after loading.
        :rtype: RAIBaseInsights
        """
        # load current state
        RAIBaseInsights._load_data(inst, path)
        load_metadata_func(inst, path)
        RAIBaseInsights._load_model(inst, path)
        RAIBaseInsights._load_managers(inst, path, manager_map)

        return inst
