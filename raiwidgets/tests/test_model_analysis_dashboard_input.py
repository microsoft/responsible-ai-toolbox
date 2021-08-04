# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from sklearn.model_selection import train_test_split
import shap
import sklearn
import mock
from responsibleai import ModelAnalysis
from raiwidgets.model_analysis_dashboard_input import \
    ModelAnalysisDashboardInput


class TestModelAnalysisDashboardInput:
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
        # ma.explainer.add()
        # ma.counterfactual.add(10, desired_class='opposite')
        ma.error_analysis.add()
        # ma.causal.add(treatment_features=['Hours per week', 'Occupation'],
        #               heterogeneity_features=None,
        #               upper_bound_on_cat_expansion=42,
        #               skip_cat_limit_checks=True)
        ma.compute()

        dashboard_input = ModelAnalysisDashboardInput(ma)
        with mock.patch.object(knn, "predict_proba") as predict_mock:
            test_pred_data = X_test.head(1).drop("Income", axis=1).values
            dashboard_input.on_predict(
                test_pred_data)

            assert (predict_mock.call_args[0]
                    [0].values == test_pred_data).all()
