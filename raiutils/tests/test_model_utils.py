# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from raiutils.models import (is_classifier, is_forecaster, is_object_detector,
                             is_quantile_forecaster)


class Classifier:
    def predict_proba(self):
        pass

    def predict(self):
        pass


class Regressor:
    def predict(self):
        pass


class Forecaster:
    def forecast(self):
        pass

    def forecast_quantiles(self):
        pass


class ObjectDetectionModel:
    def predict_proba(self):
        pass

    def predict(self):
        pass


class TestModel:
    def test_classifier(self):
        classifier = Classifier()
        assert is_classifier(classifier)
        assert not is_forecaster(classifier)
        assert not is_quantile_forecaster(classifier)

    def test_regressor(self):
        regressor = Regressor()
        assert not is_classifier(regressor)
        assert not is_forecaster(regressor)
        assert not is_quantile_forecaster(regressor)

    def test_forecaster(self):
        forecaster = Forecaster()
        assert not is_classifier(forecaster)
        assert is_forecaster(forecaster)
        assert is_quantile_forecaster(forecaster)

    def test_object_detector(self):
        object_detector = ObjectDetectionModel()
        assert is_object_detector(object_detector)
        assert not is_forecaster(object_detector)
        assert not is_quantile_forecaster(object_detector)
