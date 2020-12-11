# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from raiwidgets import ExplanationDashboard, ModelPerformanceDashboard
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_iris
from sklearn import svm

from interpret.ext.blackbox import TabularExplainer

iris = load_iris()
X = iris['data']
y = iris['target']
classes = iris['target_names']
feature_names = iris['feature_names']

x_train, x_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=0)

clf = svm.SVC(gamma=0.001, C=100., probability=True)
model = clf.fit(x_train, y_train)

explainer = TabularExplainer(model,
                             x_train,
                             features=feature_names,
                             classes=classes)

global_explanation = explainer.explain_global(x_test)


instance_num = 0
local_explanation = explainer.explain_local(x_test[instance_num, :])

prediction_value = clf.predict(x_test)[instance_num]

sorted_local_importance_values = local_explanation.get_ranked_local_values()[
    prediction_value]
sorted_local_importance_names = local_explanation.get_ranked_local_names()[
    prediction_value]


ExplanationDashboard(global_explanation, model, dataset=x_test, true_y=y_test)
ModelPerformanceDashboard(model, dataset=x_test, true_y=y_test)

input("Press Enter to continue...")
