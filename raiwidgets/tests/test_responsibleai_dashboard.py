# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import shap
import sklearn
from sklearn.model_selection import train_test_split

from raiwidgets import ResponsibleAIDashboard
from responsibleai import RAIInsights
from responsibleai._interfaces import (CausalData, CounterfactualData, Dataset,
                                       ErrorAnalysisData, ModelExplanationData)

from raiwidgets.cohort import Cohort, CohortFilterMethods, CohortFilter


class TestResponsibleAIDashboard:

    def validate_rai_dashboard_data(self, rai_widget):
        assert isinstance(
            rai_widget.input.dashboard_input.dataset,
            Dataset)
        assert isinstance(
            rai_widget.input.dashboard_input.modelExplanationData[0],
            ModelExplanationData)
        assert isinstance(
            rai_widget.input.dashboard_input.errorAnalysisData[0],
            ErrorAnalysisData)
        assert isinstance(
            rai_widget.input.dashboard_input.causalAnalysisData[0],
            CausalData)
        assert isinstance(
            rai_widget.input.dashboard_input.counterfactualData[0],
            CounterfactualData)

    def test_responsibleai_adult(self, tmpdir):
        X, y = shap.datasets.adult()
        y = [1 if r else 0 for r in y]

        X, y = sklearn.utils.resample(
            X, y, n_samples=1000, random_state=7, stratify=y)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.01, random_state=7, stratify=y)

        knn = sklearn.neighbors.KNeighborsClassifier()
        knn.fit(X_train, y_train)

        X['Income'] = y
        X_test['Income'] = y_test

        ri = RAIInsights(knn, X, X_test, 'Income', 'classification',
                         categorical_features=['Workclass', 'Education-Num',
                                               'Marital Status',
                                               'Occupation', 'Relationship',
                                               'Race',
                                               'Sex', 'Country'])
        ri.explainer.add()
        ri.counterfactual.add(10, desired_class='opposite')
        ri.error_analysis.add()
        ri.causal.add(treatment_features=['Hours per week', 'Occupation'],
                      heterogeneity_features=None,
                      upper_bound_on_cat_expansion=42,
                      skip_cat_limit_checks=True)
        ri.compute()

        widget = ResponsibleAIDashboard(ri)
        self.validate_rai_dashboard_data(widget)

        save_dir = tmpdir.mkdir('save-dir')
        ri.save(save_dir)
        ri_copy = ri.load(save_dir)

        widget_copy = ResponsibleAIDashboard(ri_copy)
        self.validate_rai_dashboard_data(widget_copy)

    def test_responsibleai_adult_with_pre_defined_cohorts(self, tmpdir):
        X, y = shap.datasets.adult()
        y = [1 if r else 0 for r in y]

        X, y = sklearn.utils.resample(
            X, y, n_samples=1000, random_state=7, stratify=y)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.01, random_state=7, stratify=y)

        knn = sklearn.neighbors.KNeighborsClassifier()
        knn.fit(X_train, y_train)

        X['Income'] = y
        X_test['Income'] = y_test

        ri = RAIInsights(knn, X, X_test, 'Income', 'classification',
                         categorical_features=['Workclass', 'Education-Num',
                                               'Marital Status',
                                               'Occupation', 'Relationship',
                                               'Race',
                                               'Sex', 'Country'])
        ri.explainer.add()
        ri.counterfactual.add(10, desired_class='opposite')
        ri.error_analysis.add()
        ri.causal.add(treatment_features=['Hours per week', 'Occupation'],
                      heterogeneity_features=None,
                      upper_bound_on_cat_expansion=42,
                      skip_cat_limit_checks=True)
        ri.compute()

        cohort_filter_1 = CohortFilter(
            method=CohortFilterMethods.LessThan,
            number=[65],
            column='Age')
        cohort_filter_2 = CohortFilter(
            method=CohortFilterMethods.GreaterThan,
            number=[40],
            column='Hours per week')

        user_cohort_1 = Cohort(name='New Cohort 1')
        user_cohort_1.add_cohort_filter(cohort_filter_1)
        user_cohort_1.add_cohort_filter(cohort_filter_2)

        cohort_filter_3 = CohortFilter(
            method=CohortFilterMethods.Includes,
            number=[2, 6, 4],
            column='Marital Status')

        user_cohort_2 = Cohort(name='New Cohort 2')
        user_cohort_2.add_cohort_filter(cohort_filter_3)

        widget = ResponsibleAIDashboard(ri, cohort_Filter_list=[user_cohort_1,
                                                                user_cohort_2])

        self.validate_rai_dashboard_data(widget)
