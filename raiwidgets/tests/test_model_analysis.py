# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from sklearn.model_selection import train_test_split
import shap
import sklearn
from responsibleai import ModelAnalysis
from raiwidgets import ModelAnalysisDashboard
from raiwidgets.interfaces import CausalData, CounterfactualData, Dataset,\
    ErrorAnalysisConfig, ModelExplanationData


class TestModelAnalysis:
    def test_model_analysis_adult(self):
        x, y = shap.datasets.adult()
        y = [1 if r else 0 for r in y]

        x, y = sklearn.utils.resample(
            x, y, n_samples=10000, random_state=7, stratify=y)

        X_train, X_test, y_train, y_test = train_test_split(
            x, y, test_size=0.2, random_state=7, stratify=y)

        knn = sklearn.neighbors.KNeighborsClassifier()
        knn.fit(X_train, y_train)

        x["income"] = y
        X_test["income"] = y_test

        ma = ModelAnalysis(knn, x, X_test, "income", "classification",
                           categorical_features=['Workclass', 'Education-Num',
                                                 'Marital Status',
                                                 'Occupation', 'Relationship',
                                                 'Race',
                                                 'Sex', 'Country'])
        ma.explainer.add()
        ma.counterfactual.add(['Age',
                               'Capital Gain', 'Capital Loss',
                               'Hours per week'], 10,
                              desired_class="opposite")
        ma.error_analysis.add()
        ma.causal.add()
        ma.compute()

        widget = ModelAnalysisDashboard(ma)
        assert isinstance(widget.input.dashboard_input.dataset,
                          Dataset)
        assert isinstance(
            widget.input.dashboard_input.modelExplanationData[0],
            ModelExplanationData)
        assert isinstance(
            widget.input.dashboard_input.errorAnalysisConfig[0],
            ErrorAnalysisConfig)
        assert isinstance(
            widget.input.dashboard_input.causalAnalysisData[0],
            CausalData)
        assert isinstance(
            widget.input.dashboard_input.counterfactualData[0],
            CounterfactualData)
