# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the RAIAnalyzer class."""

import json
import pandas as pd
import pickle
from pathlib import Path
from raitools.raianalyzer.constants import ManagerNames, Metadata
from raitools._managers.causal_manager import CausalManager
from raitools._managers.counterfactual_manager import CounterfactualManager
from raitools._managers.error_analysis_manager import ErrorAnalysisManager
from raitools._managers.explainer_manager import ExplainerManager
from raitools._managers.fairness_manager import FairnessManager

DTYPES = 'dtypes'
TRAIN = 'train'
TEST = 'test'
TARGET_COLUMN = 'target_column'
TASK_TYPE = 'task_type'
MODEL = Metadata.MODEL
MODEL_PKL = MODEL + '.pkl'
SERIALIZER = 'serializer'
CLASSES = 'classes'
MANAGERS = 'managers'
META_JSON = Metadata.META_JSON


class RAIAnalyzer(object):

    """Defines the top-level RAI Analyzer.

    Use the RAI Analyzer to analyze errors, explain the most important
    features, validate fairness, compute counterfactuals and run causal
    analysis in a single API.

    :param model: The model to explain.
        A model that implements sklearn.predict or sklearn.predict_proba
        or function that accepts a 2d ndarray.
    :type model: object
    :param train: The training dataset.
    :type train: pandas.DataFrame
    :param test: The test dataset.
    :type test: pandas.DataFrame
    :param target_column: The name of the label column.
    :type target_column: str
    :param task_type: The task to run, can be `classification` or
        `regression`.
    :type task_type: str
    :param serializer: Picklable custom serializer with save and load
        methods defined for model that is not serializable. The save
        method returns a dictionary state and load method returns the model.
    :type serializer: object
    """

    def __init__(self, model, train, test, target_column,
                 task_type, serializer=None):
        """Defines the top-level RAI Analyzer.

        Use the RAI Analyzer to analyze errors, explain the most important
        features, validate fairness, compute counterfactuals and run causal
        analysis in a single API.

        :param model: The model to explain.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param train: The training dataset.
        :type train: pandas.DataFrame
        :param test: The test dataset.
        :type test: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        :param task_type: The task to run, can be `classification` or
            `regression`.
        :type task_type: str
        """
        self.model = model
        self.train = train
        self.test = test
        self.target_column = target_column
        self.task_type = task_type
        self._serializer = serializer
        self._causal_manager = CausalManager()
        self._counterfactual_manager = CounterfactualManager()
        self._error_analysis_manager = ErrorAnalysisManager()
        self._classes = train[target_column].unique()
        self._explainer_manager = ExplainerManager(model, train, test,
                                                   target_column,
                                                   self._classes)
        self._fairness_manager = FairnessManager()
        self._managers = [self._causal_manager,
                          self._counterfactual_manager,
                          self._error_analysis_manager,
                          self._explainer_manager,
                          self._fairness_manager]

    @property
    def causal(self):
        """Get the causal manager.

        :return: The causal manager.
        :rtype: CausalManager
        """
        return self._causal_manager

    @property
    def counterfactual(self):
        """Get the counterfactual manager.

        :return: The counterfactual manager.
        :rtype: CounterfactualManager
        """
        return self._counterfactual_manager

    @property
    def erroranalysis(self):
        """Get the error analysis manager.

        :return: The error analysis manager.
        :rtype: ErrorAnalysisManager
        """
        return self._error_analysis_manager

    @property
    def explainer(self):
        """Get the explainer manager.

        :return: The explainer manager.
        :rtype: ExplainerManager
        """
        return self._explainer_manager

    @property
    def fairness(self):
        """Get the fairness manager.

        :return: The fairness manager.
        :rtype: FairnessManager
        """
        return self._fairness_manager

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

    def _write_to_file(self, file_path, content):
        """Save the string content to the given file path.

        :param file_path: The file path to save the content to.
        :type file_path: str
        :param content: The string content to save.
        :type content: str
        """
        with open(file_path, 'w') as file:
            file.write(content)

    def save(self, path):
        """Save the RAIAnalyzer to the given path.

        :param path: The directory path to save the RAIAnalyzer to.
        :type path: str
        """
        top_dir = Path(path)
        # save each of the individual managers
        for manager in self._managers:
            manager.save(top_dir / manager.name)
        # save current state
        dtypes = self.train.dtypes.astype(str).to_dict()
        self._write_to_file(top_dir / (TRAIN + DTYPES),
                            json.dumps(dtypes))
        self._write_to_file(top_dir / TRAIN, self.train.to_json())
        dtypes = self.test.dtypes.astype(str).to_dict()
        self._write_to_file(top_dir / (TEST + DTYPES),
                            json.dumps(dtypes))
        self._write_to_file(top_dir / TEST, self.test.to_json())
        meta = {TARGET_COLUMN: self.target_column,
                TASK_TYPE: self.task_type}
        with open(top_dir / META_JSON, 'w') as file:
            json.dump(meta, file)
        if self._serializer is not None:
            model_data = self._serializer.save(self.model)
            # save the serializer
            with open(top_dir / SERIALIZER, 'wb') as file:
                pickle.dump(self._serializer, file)
            # save the model
            self._write_to_file(top_dir / MODEL_PKL, model_data)
        else:
            has_setstate = hasattr(self.model, '__setstate__')
            has_getstate = hasattr(self.model, '__getstate__')
            if not (has_setstate and has_getstate):
                raise ValueError(
                    "Model must be picklable or a custom serializer must"
                    " be specified")
            with open(top_dir / MODEL_PKL, 'wb') as file:
                pickle.dump(self.model, file)

    @staticmethod
    def load(path):
        """Load the RAIAnalyzer from the given path.

        :param path: The directory path to load the RAIAnalyzer from.
        :type path: str
        """
        # create the RAIAnalyzer without any properties using the __new__
        # function, similar to pickle
        inst = RAIAnalyzer.__new__(RAIAnalyzer)
        top_dir = Path(path)
        # load current state
        with open(top_dir / (TRAIN + DTYPES), 'r') as file:
            types = json.load(file)
        with open(top_dir / TRAIN, 'r') as file:
            train = pd.read_json(file, dtype=types)
        inst.__dict__[TRAIN] = train
        with open(top_dir / (TEST + DTYPES), 'r') as file:
            types = json.load(file)
        with open(top_dir / TEST, 'r') as file:
            test = pd.read_json(file, dtype=types)
        inst.__dict__[TEST] = test
        with open(top_dir / META_JSON, 'r') as meta_file:
            meta = meta_file.read()
        meta = json.loads(meta)
        target_column = meta[TARGET_COLUMN]
        inst.__dict__[TARGET_COLUMN] = target_column
        inst.__dict__[TASK_TYPE] = meta[TASK_TYPE]
        inst.__dict__['_' + CLASSES] = train[target_column].unique()
        serializer_path = top_dir / SERIALIZER
        if serializer_path.exists():
            with open(serializer_path) as file:
                serializer = pickle.load(file)
            inst.__dict__['_' + SERIALIZER] = serializer
            with open(top_dir / MODEL_PKL, 'rb') as file:
                inst.__dict__[MODEL] = serializer.load(file)
        else:
            inst.__dict__['_' + SERIALIZER] = None
            with open(top_dir / MODEL_PKL, 'rb') as file:
                inst.__dict__[MODEL] = pickle.load(file)
        # load each of the individual managers
        manager_names = ManagerNames.get_managers()
        managers = []
        kvp_manager = {ManagerNames.CAUSAL: CausalManager,
                       ManagerNames.COUNTERFACTUAL: CounterfactualManager,
                       ManagerNames.ERROR_ANALYSIS: ErrorAnalysisManager,
                       ManagerNames.EXPLAINER: ExplainerManager,
                       ManagerNames.FAIRNESS: FairnessManager}
        for manager_name in manager_names:
            manager_cls = kvp_manager[manager_name]
            manager = manager_cls.load(top_dir / manager_name, inst)
            _manager_name = manager_name.replace(' ', '_')
            inst.__dict__['_' + _manager_name + '_manager'] = manager
            managers.append(manager)
        inst.__dict__['_' + MANAGERS] = managers
        return inst
