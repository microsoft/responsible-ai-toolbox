# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os
import shutil
from pathlib import Path
from tempfile import TemporaryDirectory

import pytest
from common_text_utils import (COVID19_EVENTS_LABELS, EMOTION,
                               MultilabelTextClassificationSerializer,
                               TextClassificationPipelineSerializer,
                               create_multilabel_pipeline,
                               create_text_classification_pipeline,
                               load_covid19_emergency_event_dataset,
                               load_emotion_dataset)
from rai_text_insights_validator import validate_rai_text_insights

from responsibleai._internal.constants import ManagerNames
from responsibleai.feature_metadata import FeatureMetadata
from responsibleai_text import ModelTask, RAITextInsights


class TestRAITextInsightsSaveAndLoadScenarios(object):

    def test_rai_insights_empty_save_load_save(self):
        data = load_emotion_dataset()
        pred = create_text_classification_pipeline()
        train = data
        test = data[:3]
        classes = train[EMOTION].unique()
        classes.sort()

        rai_insights = RAITextInsights(
            pred, test, EMOTION,
            task_type=ModelTask.TEXT_CLASSIFICATION,
            serializer=TextClassificationPipelineSerializer(),
            classes=classes)

        with TemporaryDirectory() as tmpdir:
            save_1 = Path(tmpdir) / "first_save"
            save_2 = Path(tmpdir) / "second_save"

            # Save it
            rai_insights.save(save_1)
            assert len(os.listdir(save_1 / ManagerNames.EXPLAINER)) == 0
            assert len(os.listdir(save_1 / ManagerNames.ERROR_ANALYSIS)) == 0

            # Load
            rai_2 = RAITextInsights.load(save_1)

            # Validate
            validate_rai_text_insights(
                rai_2, classes, test,
                EMOTION, ModelTask.TEXT_CLASSIFICATION)

            # Save again
            rai_2.save(save_2)
            assert len(os.listdir(save_2 / ManagerNames.EXPLAINER)) == 0
            assert len(os.listdir(save_2 / ManagerNames.ERROR_ANALYSIS)) == 0

    @pytest.mark.parametrize('manager_type', [ManagerNames.EXPLAINER,
                                              ManagerNames.ERROR_ANALYSIS])
    def test_rai_insights_save_load_add_save(self, manager_type):
        data = load_emotion_dataset()
        pred = create_text_classification_pipeline()
        train = data
        test = data[:3]
        classes = train[EMOTION].unique()
        classes.sort()

        rai_insights = RAITextInsights(
            pred, test, EMOTION,
            task_type=ModelTask.TEXT_CLASSIFICATION,
            serializer=TextClassificationPipelineSerializer(),
            classes=classes)

        with TemporaryDirectory() as tmpdir:
            save_1 = Path(tmpdir) / "first_save"
            save_2 = Path(tmpdir) / "second_save"

            # Save it
            rai_insights.save(save_1)

            # Load
            rai_2 = RAITextInsights.load(save_1)

            # Call a single manager
            if manager_type == ManagerNames.EXPLAINER:
                rai_2.explainer.add()
            elif manager_type == ManagerNames.ERROR_ANALYSIS:
                rai_2.error_analysis.add()
            else:
                raise ValueError(
                    "Bad manager_type: {0}".format(manager_type))

            rai_2.compute()

            # Validate
            validate_rai_text_insights(
                rai_2, classes, test,
                EMOTION, ModelTask.TEXT_CLASSIFICATION)

            # Save again
            rai_2.save(save_2)

    def test_loading_rai_insights_without_model_file(self):
        data = load_emotion_dataset()
        pred = create_text_classification_pipeline()
        train = data
        test = data[:3]
        classes = train[EMOTION].unique()
        classes.sort()

        rai_insights = RAITextInsights(
            pred, test, EMOTION,
            task_type=ModelTask.TEXT_CLASSIFICATION,
            serializer=TextClassificationPipelineSerializer(),
            classes=classes)

        with TemporaryDirectory() as tmpdir:
            assert rai_insights.model is not None
            save_path = Path(tmpdir) / "rai_insights"
            rai_insights.save(save_path)

            # Remove the model.pkl file to cause an exception to occur
            # while loading the model.
            model_name = 'text-classification-model'
            model_pkl_path = Path(tmpdir) / "rai_insights" / model_name
            shutil.rmtree(model_pkl_path)
            match_msg = 'Can\'t load the configuration'
            with pytest.raises(OSError, match=match_msg):
                without_model_rai_insights = RAITextInsights.load(save_path)
                assert without_model_rai_insights.model is None

    @pytest.mark.parametrize('manager_type', [ManagerNames.EXPLAINER,
                                              ManagerNames.ERROR_ANALYSIS])
    def test_rai_insights_add_save_load_save(self, manager_type):
        data = load_emotion_dataset()
        pred = create_text_classification_pipeline()
        train = data
        test = data[:3]
        classes = train[EMOTION].unique()
        classes.sort()

        rai_insights = RAITextInsights(
            pred, test, EMOTION,
            task_type=ModelTask.TEXT_CLASSIFICATION,
            serializer=TextClassificationPipelineSerializer(),
            classes=classes)

        # Call a single manager
        if manager_type == ManagerNames.EXPLAINER:
            rai_insights.explainer.add()
        elif manager_type == ManagerNames.ERROR_ANALYSIS:
            rai_insights.error_analysis.add()
        else:
            raise ValueError(
                "Bad manager_type: {0}".format(manager_type))

        rai_insights.compute()

        with TemporaryDirectory() as tmpdir:
            save_1 = Path(tmpdir) / "first_save"
            save_2 = Path(tmpdir) / "second_save"

            # Save it
            rai_insights.save(save_1)

            # Load
            rai_2 = RAITextInsights.load(save_1)

            # Validate
            validate_rai_text_insights(
                rai_2, classes, test,
                EMOTION, ModelTask.TEXT_CLASSIFICATION)

            # Save again
            rai_2.save(save_2)

    @pytest.mark.skip(reason="Test takes too long to run. Enable if needed.")
    @pytest.mark.parametrize('manager_type', [ManagerNames.EXPLAINER,
                                              ManagerNames.ERROR_ANALYSIS])
    def test_rai_insights_metadata_save_load_save(self, manager_type):
        data = load_covid19_emergency_event_dataset(with_metadata=True)
        pred = create_multilabel_pipeline()
        task_type = ModelTask.MULTILABEL_TEXT_CLASSIFICATION
        labels = COVID19_EVENTS_LABELS
        feature_metadata = FeatureMetadata()
        feature_metadata.categorical_features = ['language', 'country']
        test = data[:3]
        classes = None

        rai_insights = RAITextInsights(
            pred, test, labels,
            task_type=task_type,
            serializer=MultilabelTextClassificationSerializer(),
            feature_metadata=feature_metadata)

        # Call a single manager
        if manager_type == ManagerNames.EXPLAINER:
            rai_insights.explainer.add()
        elif manager_type == ManagerNames.ERROR_ANALYSIS:
            rai_insights.error_analysis.add()
        else:
            raise ValueError(
                "Bad manager_type: {0}".format(manager_type))

        rai_insights.compute()

        with TemporaryDirectory() as tmpdir:
            save_1 = Path(tmpdir) / "first_save"
            save_2 = Path(tmpdir) / "second_save"

            # Save it
            rai_insights.save(save_1)

            # Load
            rai_2 = RAITextInsights.load(save_1)

            # Validate
            validate_rai_text_insights(
                rai_2, classes, test,
                labels, ModelTask.MULTILABEL_TEXT_CLASSIFICATION)

            # Save again
            rai_2.save(save_2)
