# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from .constants import SKLearn


def _is_classifier(model):
    return (model is not None and
            hasattr(model, SKLearn.PREDICT_PROBA) and
            model.predict_proba is not None)
