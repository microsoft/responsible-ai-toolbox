# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the RAIAnalyzer class."""

from raitools._managers.causal_manager import CausalManager
from raitools._managers.counterfactual_manager import CounterfactualManager
from raitools._managers.error_analysis_manager import ErrorAnalysisManager
from raitools._managers.explainer_manager import ExplainerManager
from raitools._managers.fairness_manager import FairnessManager


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
    """

    def __init__(self, model, train, test, target_column,
                 task_type):
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
        self._causal_manager = CausalManager()
        self._counterfactual_manager = CounterfactualManager(
            model=model, train=train, test=test,
            target_column=target_column, task_type=task_type)
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

    def save(self, path):
        # TODO: implement
        raise NotImplementedError(
            "Save not implemented for RAIAnalyzer")

    @staticmethod
    def load(path):
        # TODO: implement
        raise NotImplementedError(
            "Load not implemented for RAIAnalyzer")
