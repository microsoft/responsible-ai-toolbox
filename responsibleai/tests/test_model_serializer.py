# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import pickle
from pathlib import Path

from responsibleai import RAIInsights

from .common_utils import create_cancer_data, create_lightgbm_classifier


class PickleSerializer:
    MODEL_FILENAME = 'model.pkl'

    def save(self, model, model_dir):
        filepath = Path(model_dir) / self.MODEL_FILENAME
        with open(filepath, 'wb') as f:
            pickle.dump(model, f)

    def load(self, model_dir):
        filepath = Path(model_dir) / self.MODEL_FILENAME
        with open(filepath, 'rb') as f:
            return pickle.load(f)


class TestModelSerializer:
    def test_roundtrip_pickle_serializer(self, tmpdir):
        model_dir = tmpdir.mkdir('model_dir')
        serializer = PickleSerializer()

        model = None
        serializer.save(model, model_dir)
        deserialized_model = serializer.load(model_dir)

        assert deserialized_model == model

    def test_init_with_pickle_serializer(self, tmpdir):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data()
        model = create_lightgbm_classifier(X_train, y_train)

        X_train['target'] = y_train
        X_test['target'] = y_test

        serializer = PickleSerializer()

        analysis = RAIInsights(
            model=model,
            train=X_train,
            test=X_test,
            target_column='target',
            task_type='classification',
            serializer=serializer
        )

        analysis_dir = tmpdir.mkdir('analysis-dir')
        analysis.save(analysis_dir)
        analysis.load(analysis_dir)
