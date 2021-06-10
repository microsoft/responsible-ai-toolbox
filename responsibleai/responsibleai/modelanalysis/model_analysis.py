# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the ModelAnalysis class."""

import json
import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from responsibleai._internal.constants import ErrorAnalysisManagerKeys,\
    ExplanationKeys, ManagerNames, Metadata, SKLearn
from responsibleai._managers.causal_manager import CausalManager
from responsibleai._managers.counterfactual_manager import (
    CounterfactualManager)
from responsibleai._managers.error_analysis_manager import ErrorAnalysisManager
from responsibleai._managers.explainer_manager import ExplainerManager
from responsibleai._interfaces import ModelAnalysisData,\
    Dataset, ModelExplanationData,\
    PrecomputedExplanations, FeatureImportance, EBMGlobalExplanation,\
    ErrorAnalysisConfig, CausalData, CounterfactualData


_DTYPES = 'dtypes'
_TRAIN = 'train'
_TEST = 'test'
_TARGET_COLUMN = 'target_column'
_TASK_TYPE = 'task_type'
_MODEL = Metadata.MODEL
_MODEL_PKL = _MODEL + '.pkl'
_SERIALIZER = 'serializer'
_CLASSES = 'classes'
_MANAGERS = 'managers'
_META_JSON = Metadata.META_JSON


class ModelAnalysis(object):

    """Defines the top-level Model Analysis API.
    Use ModelAnalysis to analyze errors, explain the most important
    features, compute counterfactuals and run causal analysis in a
    single API.
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
    :param task_type: The task to run, can be `classification` or
        `regression`.
    :type task_type: str
    :param serializer: Picklable custom serializer with save and load
        methods defined for model that is not serializable. The save
        method returns a dictionary state and load method returns the model.
    :type serializer: object
    """

    def __init__(self, model, train, test, target_column,
                 task_type, categorical_features, train_labels=None,
                 serializer=None):
        """Defines the top-level Model Analysis API.
        Use ModelAnalysis to analyze errors, explain the most important
        features, compute counterfactuals and run causal analysis in a
        single API.
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
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        :param task_type: The task to run, can be `classification` or
            `regression`.
        :type task_type: str
        :param train_labels: The class labels in the training dataset
        :type train_labels: ndarray
        """
        self.model = model
        self.train = train
        self.test = test
        self.target_column = target_column
        self.task_type = task_type
        self.categorical_features = categorical_features
        self._serializer = serializer
        self._causal_manager = CausalManager(
            train, test, target_column, task_type, categorical_features)
        self._counterfactual_manager = CounterfactualManager(
            model=model, train=train, test=test,
            target_column=target_column, task_type=task_type)
        self._error_analysis_manager = ErrorAnalysisManager(model,
                                                            train,
                                                            target_column)
        if train_labels is None:
            self._classes = train[target_column].unique()
        else:
            self._classes = train_labels
        self._explainer_manager = ExplainerManager(model, train, test,
                                                   target_column,
                                                   self._classes)
        self._managers = [self._causal_manager,
                          self._counterfactual_manager,
                          self._error_analysis_manager,
                          self._explainer_manager]

    @property
    def causal(self) -> CausalManager:
        """Get the causal manager.
        :return: The causal manager.
        :rtype: CausalManager
        """
        return self._causal_manager

    @property
    def counterfactual(self) -> CounterfactualManager:
        """Get the counterfactual manager.
        :return: The counterfactual manager.
        :rtype: CounterfactualManager
        """
        return self._counterfactual_manager

    @property
    def error_analysis(self) -> ErrorAnalysisManager:
        """Get the error analysis manager.
        :return: The error analysis manager.
        :rtype: ErrorAnalysisManager
        """
        return self._error_analysis_manager

    @property
    def explainer(self) -> ExplainerManager:
        """Get the explainer manager.
        :return: The explainer manager.
        :rtype: ExplainerManager
        """
        return self._explainer_manager

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

    def get_data(self):
        """Get all data as ModelAnalysisData object

        :return: Model Analysis Data
        :rtype: ModelAnalysisData
        """
        data = ModelAnalysisData()
        data.dataset = self._get_dataset()
        data.modelExplanationData = [
            self._get_interpret(i) for i in self._analysis.explainer.get()]
        data.errorAnalysisConfig = [
            self._get_error_analysis(i)
            for i in self._analysis.error_analysis.list()["reports"]]
        data.causalAnalysisData = [
            self._get_causal(i)
            for i in self._analysis.causal.get()]
        data.counterfactualData = [
            self._get_counterfactual(i)
            for i in self._analysis.counterfactual.get()]

    def _get_dataset(self):
        dashboard_dataset = Dataset()
        dashboard_dataset.classNames = self._convert_to_list(
            self._analysis._classes)

        predicted_y = None
        feature_length = None

        dataset: pd.DataFrame = self._analysis.test.drop(
            [self._analysis.target_column], axis=1)

        if isinstance(dataset, pd.DataFrame) and hasattr(dataset, 'columns'):
            self._dataframeColumns = dataset.columns
        try:
            list_dataset = self._convert_to_list(dataset)
        except Exception as ex:
            raise ValueError(
                "Unsupported dataset type") from ex
        if dataset is not None and self._analysis.model is not None:
            try:
                predicted_y = self._analysis.model.predict(dataset)
            except Exception as ex:
                msg = "Model does not support predict method for given"
                "dataset type"
                raise ValueError(msg) from ex
            try:
                predicted_y = self._convert_to_list(predicted_y)
            except Exception as ex:
                raise ValueError(
                    "Model prediction output of unsupported type,") from ex
        if predicted_y is not None:
            if(self._analysis.task_type == "classification" and
                    dashboard_dataset.classNames is not None):
                predicted_y = [dashboard_dataset.classNames.index(
                    y) for y in predicted_y]
            dashboard_dataset.predictedY = predicted_y
        row_length = 0

        if list_dataset is not None:
            row_length, feature_length = np.shape(list_dataset)
            if row_length > 100000:
                raise ValueError(
                    "Exceeds maximum number of rows"
                    "for visualization (100000)")
            if feature_length > 1000:
                raise ValueError("Exceeds maximum number of features for"
                                 " visualization (1000). Please regenerate the"
                                 " explanation using fewer features or"
                                 " initialize the dashboard without passing a"
                                 " dataset.")
            dashboard_dataset.features = list_dataset

        true_y = self._analysis.test[self._analysis.target_column]

        if true_y is not None and len(true_y) == row_length:
            if(self._analysis.task_type == "classification" and
               dashboard_dataset.classNames is not None):
                true_y = [dashboard_dataset.classNames.index(
                    y) for y in true_y]
            dashboard_dataset.trueY = self._convert_to_list(true_y)

        features = dataset.columns

        if features is not None:
            features = self._convert_to_list(features)
            if feature_length is not None and len(features) != feature_length:
                raise ValueError("Feature vector length mismatch:"
                                 " feature names length differs"
                                 " from local explanations dimension")
            dashboard_dataset.featureNames = features

        if (self._analysis.model is not None and
                hasattr(self._analysis.model, SKLearn.PREDICT_PROBA) and
                self._analysis.model.predict_proba is not None and
                dataset is not None):
            try:
                probability_y = self._analysis.model.predict_proba(dataset)
            except Exception as ex:
                raise ValueError("Model does not support predict_proba method"
                                 " for given dataset type,") from ex
            try:
                probability_y = self._convert_to_list(probability_y)
            except Exception as ex:
                raise ValueError(
                    "Model predict_proba output of unsupported type,") from ex
            dashboard_dataset.probabilityY = probability_y

        return dashboard_dataset

    def _get_interpret(self, explanation):
        interpretation = ModelExplanationData()

        # List of explanations, key of explanation type is "explanation_type"
        if explanation is not None:
            mli_explanations = explanation.data(-1)["mli"]
        else:
            mli_explanations = None
        local_explanation = self._find_first_explanation(
            ExplanationKeys.MLI_LOCAL_EXPLANATION_KEY,
            mli_explanations)
        global_explanation = self._find_first_explanation(
            ExplanationKeys.MLI_GLOBAL_EXPLANATION_KEY,
            mli_explanations)
        ebm_explanation = self._find_first_explanation(
            ExplanationKeys.MLI_EBM_GLOBAL_EXPLANATION_KEY,
            mli_explanations)

        if explanation is not None and hasattr(explanation, 'method'):
            interpretation.method = explanation.method

        local_dim = None

        if local_explanation is not None or global_explanation is not None\
                or ebm_explanation is not None:
            interpretation.precomputedExplanations = PrecomputedExplanations()

        if local_explanation is not None:
            try:
                local_feature_importance = FeatureImportance()
                local_feature_importance.scores = self._convert_to_list(
                    local_explanation["scores"])
                if np.shape(local_feature_importance.scores)[-1] > 1000:
                    raise ValueError("Exceeds maximum number of features for "
                                     "visualization (1000). Please regenerate"
                                     " the explanation using fewer features.")
                local_feature_importance.intercept = self._convert_to_list(
                    local_explanation["intercept"])
                # We can ignore perf explanation data.
                # Note if it is added back at any point,
                # the numpy values will need to be converted to python,
                # otherwise serialization fails.
                local_explanation["perf"] = None
                interpretation.precomputedExplanations.localFeatureImportance\
                    = local_feature_importance
            except Exception as ex:
                raise ValueError(
                    "Unsupported local explanation type") from ex
            if self._analysis.test is not None:
                local_dim = np.shape(local_feature_importance.scores)
                if len(local_dim) != 2 and len(local_dim) != 3:
                    raise ValueError(
                        "Local explanation expected to be a 2D or 3D list")
                if (len(local_dim) == 2 and
                    (local_dim[1] != self._feature_length or
                     local_dim[0] != self._row_length)):
                    raise ValueError(
                        "Shape mismatch: local explanation"
                        "length differs from dataset")
                if(len(local_dim) == 3 and
                   (local_dim[2] != self._feature_length or
                        local_dim[1] != self._row_length)):
                    raise ValueError(
                        "Shape mismatch: local explanation"
                        " length differs from dataset")
        if global_explanation is not None:
            try:
                global_feature_importance = FeatureImportance()
                global_feature_importance.scores = self._convert_to_list(
                    global_explanation["scores"])
                if 'intercept' in global_explanation:
                    global_feature_importance.intercept\
                        = self._convert_to_list(
                            global_explanation["intercept"])
                interpretation.precomputedExplanations.globalFeatureImportance\
                    = global_explanation
            except Exception as ex:
                raise ValueError("Unsupported global explanation type") from ex
        if ebm_explanation is not None:
            try:
                ebm_feature_importance = EBMGlobalExplanation()
                ebm_feature_importance.feature_list\
                    = ebm_explanation["feature_list"]
                interpretation.precomputedExplanations.ebmGlobalExplanation\
                    = ebm_feature_importance

            except Exception as ex:
                raise ValueError(
                    "Unsupported ebm explanation type") from ex
        return interpretation

    def _get_error_analysis(self, report):
        error_analysis = ErrorAnalysisConfig()
        error_analysis.maxDepth = report[ErrorAnalysisManagerKeys.MAX_DEPTH]
        error_analysis.numLeaves = report[ErrorAnalysisManagerKeys.NUM_LEAVES]
        return error_analysis

    def _get_causal(self, causal):
        causal_data = CausalData()
        causal_data.globalCausalEffects = causal["global_effects"]\
            .reset_index().to_dict(orient="records")
        causal_data.localCausalEffects = causal["local_effects"]\
            .groupby("sample").apply(
                lambda x: x.reset_index().to_dict(
                    orient='records')).values
        return causal_data

    def _get_counterfactual(self, counterfactual):
        counterfactual_data = CounterfactualData()
        json_data = json.loads(counterfactual.to_json())
        counterfactual_data.cfsList = json_data["cfs_list"]
        counterfactual_data.featureNames = json_data[
            "feature_names_including_target"]
        return counterfactual_data

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
        """Save the ModelAnalysis to the given path.
        :param path: The directory path to save the ModelAnalysis to.
        :type path: str
        """
        top_dir = Path(path)
        # save each of the individual managers
        for manager in self._managers:
            manager._save(top_dir / manager.name)
        # save current state
        dtypes = self.train.dtypes.astype(str).to_dict()
        self._write_to_file(top_dir / (_TRAIN + _DTYPES),
                            json.dumps(dtypes))
        self._write_to_file(top_dir / _TRAIN, self.train.to_json())
        dtypes = self.test.dtypes.astype(str).to_dict()
        self._write_to_file(top_dir / (_TEST + _DTYPES),
                            json.dumps(dtypes))
        self._write_to_file(top_dir / _TEST, self.test.to_json())
        meta = {_TARGET_COLUMN: self.target_column,
                _TASK_TYPE: self.task_type}
        with open(top_dir / _META_JSON, 'w') as file:
            json.dump(meta, file)
        if self._serializer is not None:
            model_data = self._serializer.save(self.model)
            # save the serializer
            with open(top_dir / _SERIALIZER, 'wb') as file:
                pickle.dump(self._serializer, file)
            # save the model
            self._write_to_file(top_dir / _MODEL_PKL, model_data)
        else:
            has_setstate = hasattr(self.model, '__setstate__')
            has_getstate = hasattr(self.model, '__getstate__')
            if not (has_setstate and has_getstate):
                raise ValueError(
                    "Model must be picklable or a custom serializer must"
                    " be specified")
            with open(top_dir / _MODEL_PKL, 'wb') as file:
                pickle.dump(self.model, file)

    @staticmethod
    def load(path):
        """Load the ModelAnalysis from the given path.
        :param path: The directory path to load the ModelAnalysis from.
        :type path: str
        """
        # create the ModelAnalysis without any properties using the __new__
        # function, similar to pickle
        inst = ModelAnalysis.__new__(ModelAnalysis)
        top_dir = Path(path)
        # load current state
        with open(top_dir / (_TRAIN + _DTYPES), 'r') as file:
            types = json.load(file)
        with open(top_dir / _TRAIN, 'r') as file:
            train = pd.read_json(file, dtype=types)
        inst.__dict__[_TRAIN] = train
        with open(top_dir / (_TEST + _DTYPES), 'r') as file:
            types = json.load(file)
        with open(top_dir / _TEST, 'r') as file:
            test = pd.read_json(file, dtype=types)
        inst.__dict__[_TEST] = test
        with open(top_dir / _META_JSON, 'r') as meta_file:
            meta = meta_file.read()
        meta = json.loads(meta)
        target_column = meta[_TARGET_COLUMN]
        inst.__dict__[_TARGET_COLUMN] = target_column
        inst.__dict__[_TASK_TYPE] = meta[_TASK_TYPE]
        inst.__dict__['_' + _CLASSES] = train[target_column].unique()
        serializer_path = top_dir / _SERIALIZER
        if serializer_path.exists():
            with open(serializer_path) as file:
                serializer = pickle.load(file)
            inst.__dict__['_' + _SERIALIZER] = serializer
            with open(top_dir / _MODEL_PKL, 'rb') as file:
                inst.__dict__[_MODEL] = serializer.load(file)
        else:
            inst.__dict__['_' + _SERIALIZER] = None
            with open(top_dir / _MODEL_PKL, 'rb') as file:
                inst.__dict__[_MODEL] = pickle.load(file)

        # load each of the individual managers
        managers = []
        cm_name = '_' + ManagerNames.CAUSAL + '_manager'
        causal_dir = top_dir / ManagerNames.CAUSAL
        causal_manager = CausalManager._load(causal_dir, inst)
        inst.__dict__[cm_name] = causal_manager
        managers.append(causal_manager)

        cfm_name = '_' + ManagerNames.COUNTERFACTUAL + '_manager'
        cf_dir = top_dir / ManagerNames.COUNTERFACTUAL
        counterfactual_manager = CounterfactualManager._load(cf_dir, inst)
        inst.__dict__[cfm_name] = counterfactual_manager
        managers.append(counterfactual_manager)

        eam_name = '_' + ManagerNames.ERROR_ANALYSIS + '_manager'
        ea_dir = top_dir / ManagerNames.ERROR_ANALYSIS
        error_analysis_manager = ErrorAnalysisManager._load(ea_dir, inst)
        inst.__dict__[eam_name] = error_analysis_manager

        exm_name = '_' + ManagerNames.EXPLAINER + '_manager'
        exp_dir = top_dir / ManagerNames.EXPLAINER
        explainer_manager = ExplainerManager._load(exp_dir, inst)
        inst.__dict__[exm_name] = explainer_manager
        managers.append(explainer_manager)

        inst.__dict__['_' + _MANAGERS] = managers
        return inst
