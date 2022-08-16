# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from raiutils.models import is_classifier


class Classifier:
    def predict_proba(self):
        pass

    def predict(self):
        pass


class Regressor:
    def predict(self):
        pass


class TestIsClassifier:
    def test_classifier(self):
        classifier = Classifier()
        assert is_classifier(classifier)

    def test_regressor(self):
        regressor = Regressor()
        assert not is_classifier(regressor)
