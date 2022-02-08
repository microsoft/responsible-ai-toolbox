# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import sklearn
from interpret.ext.blackbox import MimicExplainer
from interpret.ext.glassbox import LGBMExplainableModel
from interpret_community.common.constants import ModelTask
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

from raiwidgets import ExplanationDashboard


class TestExplanationDashboardDashboard:
    def test_explanation_dashboard_many_columns(self):
        X, y = make_classification(n_features=2000)

        # Split data into train and test
        X_train, X_test, y_train, y_test = train_test_split(X,
                                                            y,
                                                            test_size=0.2,
                                                            random_state=0)
        classes = np.unique(y_train).tolist()
        feature_names = ["col" + str(i) for i in list(range(X_train.shape[1]))]
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)
        knn = sklearn.neighbors.KNeighborsClassifier()
        knn.fit(X_train, y_train)

        model_task = ModelTask.Classification
        explainer = MimicExplainer(knn,
                                   X_train,
                                   LGBMExplainableModel,
                                   model_task=model_task)
        global_explanation = explainer.explain_global(X_test)

        ExplanationDashboard(explanation=global_explanation, model=knn,
                             dataset=X_test, true_y=y_test, classes=classes)
