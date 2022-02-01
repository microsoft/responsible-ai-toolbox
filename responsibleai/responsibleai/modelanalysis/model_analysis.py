# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the ModelAnalysis class."""

import warnings

from responsibleai.managers.causal_manager import CausalManager
from responsibleai.managers.counterfactual_manager import CounterfactualManager
from responsibleai.managers.error_analysis_manager import ErrorAnalysisManager
from responsibleai.managers.explainer_manager import ExplainerManager
from responsibleai.rai_insights import RAIInsights


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
    :param categorical_features: The categorical feature names.
    :type categorical_features: list[str]
    :param train_labels: The class labels in the training dataset
    :type train_labels: ndarray
    :param serializer: Picklable custom serializer with save and load
        methods for custom model serialization.
        The save method writes the model to file given a parent directory.
        The load method returns the deserialized model from the same
        parent directory.
    :type serializer: object
    """

    def __init__(self, model, train, test, target_column,
                 task_type, categorical_features=None, train_labels=None,
                 serializer=None,
                 maximum_rows_for_test: int = 5000):
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
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        :param train_labels: The class labels in the training dataset
        :type train_labels: ndarray
        :param serializer: Picklable custom serializer with save and load
            methods defined for model that is not serializable. The save
            method returns a dictionary state and load method returns the
            model.
        :type serializer: object
        :param maximum_rows_for_test: Limit on size of test data
            (for performance reasons)
        :type maximum_rows_for_test: int
        """
        warnings.warn(
            "MODULE-DEPRECATION-WARNING: ModelAnalysis in responsibleai "
            "package is deprecated. Please use RAIInsights instead.",
            DeprecationWarning)
        self.rai_insights = RAIInsights(
            model,
            train,
            test,
            target_column,
            task_type,
            categorical_features=categorical_features,
            classes=train_labels,
            serializer=serializer,
            maximum_rows_for_test=maximum_rows_for_test)
        self.model = self.rai_insights.model
        self.train = self.rai_insights.train
        self.test = self.rai_insights.test
        self.target_column = self.rai_insights.target_column
        self.task_type = self.rai_insights.task_type
        self.categorical_features = self.rai_insights.categorical_features

    @property
    def causal(self) -> CausalManager:
        """Get the causal manager.
        :return: The causal manager.
        :rtype: CausalManager
        """
        return self.rai_insights.causal

    @property
    def counterfactual(self) -> CounterfactualManager:
        """Get the counterfactual manager.
        :return: The counterfactual manager.
        :rtype: CounterfactualManager
        """
        return self.rai_insights.counterfactual

    @property
    def error_analysis(self) -> ErrorAnalysisManager:
        """Get the error analysis manager.
        :return: The error analysis manager.
        :rtype: ErrorAnalysisManager
        """
        return self.rai_insights.error_analysis

    @property
    def explainer(self) -> ExplainerManager:
        """Get the explainer manager.
        :return: The explainer manager.
        :rtype: ExplainerManager
        """
        return self.rai_insights.explainer

    def compute(self):
        """Calls compute on each of the managers."""
        self.rai_insights.compute()

    def list(self):
        """List information about each of the managers.
        :return: Information about each of the managers.
        :rtype: dict
        """
        return self.rai_insights.list()

    def get(self):
        """List information about each of the managers.

        :return: Information about each of the managers.
        :rtype: dict
        """
        return self.rai_insights.get()

    def get_data(self):
        """Get all data as ModelAnalysisData object

        :return: Model Analysis Data
        :rtype: ModelAnalysisData
        """
        return self.rai_insights.get_data()

    def save(self, path):
        """Save the ModelAnalysis to the given path.
        :param path: The directory path to save the ModelAnalysis to.
        :type path: str
        """
        self.rai_insights.save(path)

    @staticmethod
    def load(path):
        """Load the ModelAnalysis from the given path.
        :param path: The directory path to load the ModelAnalysis from.
        :type path: str
        :return: The ModelAnlysis object after loading.
        :rtype: ModelAnlysis
        """
        # create the ModelAnalysis without any properties using the __new__
        # function, similar to pickle
        inst = ModelAnalysis.__new__(ModelAnalysis)
        inst.rai_insights = RAIInsights.load(path)
        inst.model = inst.rai_insights.model
        inst.train = inst.rai_insights.train
        inst.test = inst.rai_insights.test
        inst.target_column = inst.rai_insights.target_column
        inst.task_type = inst.rai_insights.task_type
        inst.categorical_features = inst.rai_insights.categorical_features
        return inst
