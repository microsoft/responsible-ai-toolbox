# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from common_text_utils import (ANSWERS, BLBOOKS_LABEL, COVID19_EVENTS_LABELS,
                               EMOTION, create_blbooks_pipeline,
                               create_multilabel_pipeline,
                               create_question_answering_pipeline,
                               create_text_classification_pipeline,
                               load_blbooks_genre_dataset,
                               load_covid19_emergency_event_dataset,
                               load_emotion_dataset, load_squad_dataset)
from rai_text_insights_validator import validate_rai_text_insights

from responsibleai.feature_metadata import FeatureMetadata
from responsibleai_text import ModelTask, RAITextInsights


class TestRAITextInsights(object):

    def test_rai_insights_emotion_classification(self):
        data = load_emotion_dataset()
        pred = create_text_classification_pipeline()
        task_type = ModelTask.TEXT_CLASSIFICATION
        run_rai_insights(pred, data, data[:3], EMOTION, task_type)

    def test_rai_insights_question_answering(self):
        data = load_squad_dataset()
        pred = create_question_answering_pipeline()
        task_type = ModelTask.QUESTION_ANSWERING
        run_rai_insights(pred, data, data[:5], ANSWERS, task_type)

    def test_rai_insights_question_answering_metadata(self):
        data = load_squad_dataset(with_metadata=True)
        pred = create_question_answering_pipeline()
        task_type = ModelTask.QUESTION_ANSWERING
        feature_metadata = FeatureMetadata()
        feature_metadata.categorical_features = ['title']
        run_rai_insights(pred, data, data[:5], ANSWERS, task_type,
                         feature_metadata)

    def test_rai_insights_multilabel(self):
        data = load_covid19_emergency_event_dataset()
        pred = create_multilabel_pipeline()
        task_type = ModelTask.MULTILABEL_TEXT_CLASSIFICATION
        labels = COVID19_EVENTS_LABELS
        run_rai_insights(pred, data, data[:5], labels, task_type)

    def test_rai_insights_multilabel_metadata(self):
        data = load_covid19_emergency_event_dataset(with_metadata=True)
        pred = create_multilabel_pipeline()
        task_type = ModelTask.MULTILABEL_TEXT_CLASSIFICATION
        labels = COVID19_EVENTS_LABELS
        feature_metadata = FeatureMetadata()
        feature_metadata.categorical_features = ['language', 'country']
        run_rai_insights(pred, data, data[:5], labels, task_type,
                         feature_metadata)

    def test_rai_insights_blbooks_genre_metadata(self):
        data = load_blbooks_genre_dataset()
        pred = create_blbooks_pipeline()
        task_type = ModelTask.TEXT_CLASSIFICATION
        feature_metadata = FeatureMetadata()
        feature_metadata.categorical_features = ['annotator_country',
                                                 'annotator_place_pub',
                                                 'annotated']
        run_rai_insights(pred, data, data[:5], BLBOOKS_LABEL, task_type,
                         feature_metadata, text_column='text')


def run_rai_insights(model, train_data, test_data,
                     target_column, task_type,
                     feature_metadata=None,
                     text_column=None):
    if task_type == ModelTask.TEXT_CLASSIFICATION:
        classes = train_data[target_column].unique()
        classes.sort()
    else:
        classes = None
    rai_insights = RAITextInsights(model, test_data,
                                   target_column,
                                   task_type=task_type,
                                   classes=classes,
                                   feature_metadata=feature_metadata,
                                   text_column=text_column)
    rai_insights.explainer.add()
    if task_type != ModelTask.QUESTION_ANSWERING:
        rai_insights.error_analysis.add()
    rai_insights.compute()
    rai_insights.get_data()
    # Validate
    validate_rai_text_insights(
        rai_insights, classes, test_data,
        target_column, task_type)
