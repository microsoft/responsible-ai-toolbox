# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from raiutils.data_processing import convert_to_list


def split_label(dataset, target_feature):
    X = dataset.drop([target_feature], axis=1)
    y = dataset[[target_feature]]
    return X, y


def create_pipeline(X, task_type):
    pipe_cfg = {
        'num_cols': X.dtypes[X.dtypes == 'int64'].index.values.tolist(),
        'cat_cols': X.dtypes[X.dtypes == 'object'].index.values.tolist(),
    }
    num_pipe = Pipeline([
        ('num_imputer', SimpleImputer(strategy='median')),
        ('num_scaler', StandardScaler())
    ])
    cat_pipe = Pipeline([
        ('cat_imputer', SimpleImputer(strategy='constant', fill_value='?')),
        ('cat_encoder', OneHotEncoder(handle_unknown='ignore', sparse=False))
    ])
    feat_pipe = ColumnTransformer([
        ('num_pipe', num_pipe, pipe_cfg['num_cols']),
        ('cat_pipe', cat_pipe, pipe_cfg['cat_cols'])
    ])

    if task_type == "classification":
        pipeline = Pipeline(
            steps=[('preprocessor', feat_pipe),
                   ('model', RandomForestClassifier(n_estimators=10,
                                                    max_depth=5))])
    else:
        pipeline = Pipeline(
            steps=[('preprocessor', feat_pipe),
                   ('model', RandomForestRegressor(n_estimators=10,
                                                   max_depth=5))])

    return pipeline


def train(task_type, feature_names, features, true_y):
    X_train = pd.DataFrame(
        data=features, columns=feature_names)
    y_train = np.array(list(true_y))
    pipeline = create_pipeline(X_train, task_type)

    model = pipeline.fit(X_train, y_train)

    def request_prediction(data):
        data = pd.DataFrame(
            data, columns=X_train.columns)
        if (task_type == "classification"):
            return json.dumps(convert_to_list(model.predict_proba(data)))
        return json.dumps(convert_to_list(model.predict(data)))

    return request_prediction
