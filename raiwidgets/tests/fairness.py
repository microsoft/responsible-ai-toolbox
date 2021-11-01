# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
from sklearn.datasets import fetch_openml
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

from raiwidgets import FairnessDashboard

data = fetch_openml(data_id=1590, as_frame=True)
X_raw = data.data
Y = (data.target == '>50K') * 1
X_raw


A = X_raw["sex"]
X = X_raw.drop(labels=['sex'], axis=1)
X = pd.get_dummies(X)

sc = StandardScaler()
X_scaled = sc.fit_transform(X)
X_scaled = pd.DataFrame(X_scaled, columns=X.columns)

le = LabelEncoder()
Y = le.fit_transform(Y)


X_train,\
    X_test,\
    Y_train,\
    Y_test,\
    A_train,\
    A_test = train_test_split(X_scaled,
                              Y,
                              A,
                              test_size=0.2,
                              random_state=0,
                              stratify=Y)


X_train = X_train.reset_index(drop=True)
A_train = A_train.reset_index(drop=True)
X_test = X_test.reset_index(drop=True)
A_test = A_test.reset_index(drop=True)


unmitigated_predictor = LogisticRegression(
    solver='liblinear', fit_intercept=True)

unmitigated_predictor.fit(X_train, Y_train)


FairnessDashboard(sensitive_features=A_test, sensitive_feature_names=['sex'],
                  y_true=Y_test,
                  y_pred={
                      "unmitigated": unmitigated_predictor.predict(X_test)
})


input("Press Enter to continue...")
