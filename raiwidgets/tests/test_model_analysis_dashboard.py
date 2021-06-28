# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from sklearn.model_selection import train_test_split
import shap
import sklearn
from responsibleai import ModelAnalysis
from raiwidgets import ModelAnalysisDashboard
from responsibleai._interfaces import CausalData, CounterfactualData, Dataset,\
    ErrorAnalysisData, ModelExplanationData


class TestModelAnalysisDashboard:
    def test_model_analysis_adult(self):
        X, y = shap.datasets.adult()
        y = [1 if r else 0 for r in y]

        X, y = sklearn.utils.resample(
            X, y, n_samples=1000, random_state=7, stratify=y)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=7, stratify=y)

        knn = sklearn.neighbors.KNeighborsClassifier()
        knn.fit(X_train, y_train)

        X['Income'] = y
        X_test['Income'] = y_test

        ma = ModelAnalysis(knn, X, X_test, 'Income', 'classification',
                           categorical_features=['Workclass', 'Education-Num',
                                                 'Marital Status',
                                                 'Occupation', 'Relationship',
                                                 'Race',
                                                 'Sex', 'Country'])
        ma.explainer.compute()
        ma.counterfactual.compute(10, desired_class='opposite')
        ma.error_analysis.compute()
        ma.causal.compute(treatment_features=['Hours per week', 'Occupation'],
                      heterogeneity_features=None,
                      upper_bound_on_cat_expansion=42,
                      skip_cat_limit_checks=True)

        widget = ModelAnalysisDashboard(ma)
        assert isinstance(widget.input.dashboard_input.dataset,
                          Dataset)
        assert isinstance(
            widget.input.dashboard_input.modelExplanationData[0],
            ModelExplanationData)
        assert isinstance(
            widget.input.dashboard_input.errorAnalysisConfig[0],
            ErrorAnalysisData)
        assert isinstance(
            widget.input.dashboard_input.causalAnalysisData[0],
            CausalData)
        assert isinstance(
            widget.input.dashboard_input.counterfactualData[0],
            CounterfactualData)
