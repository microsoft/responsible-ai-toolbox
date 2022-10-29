# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from lightgbm import LGBMClassifier


def create_lightgbm_classifier(X, y):
    lgbm = LGBMClassifier(boosting_type='gbdt', learning_rate=0.1,
                          max_depth=5, n_estimators=200, n_jobs=1,
                          random_state=777)
    model = lgbm.fit(X, y)
    return model
