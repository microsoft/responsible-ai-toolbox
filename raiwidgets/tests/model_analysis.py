# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from raiwidgets import ModelAnalysisDashboard
from responsibleai import ModelAnalysis
import sklearn
import shap
import pandas as pd

x, y = shap.datasets.adult()
y = [1 if r else 0 for r in y]


x_train, x_test, y_train, y_test = sklearn.model_selection.train_test_split(
    x, y, test_size=0.2, random_state=7)

knn = sklearn.neighbors.KNeighborsClassifier()
knn.fit(x_train, y_train)


train = pd.merge(x, pd.DataFrame(
    y, columns=["income"]), left_index=True, right_index=True)
test = pd.merge(x_test, pd.DataFrame(y_test, columns=[
                "income"]), left_index=True, right_index=True)

ma = ModelAnalysis(knn, train, test, "income", "classification",
                   categorical_features=['Workclass', 'Education-Num',
                                         'Marital Status',
                                         'Occupation', 'Relationship', 'Race',
                                         'Sex', 'Country'])
ma.explainer.add()
ma.counterfactual.add(['Age',
                       'Capital Gain', 'Capital Loss',
                       'Hours per week'], 10,
                      desired_class="opposite")
ma.error_analysis.add()
ma.causal.add()
ma.compute()

ModelAnalysisDashboard(ma)


input("Press Enter to continue...")
