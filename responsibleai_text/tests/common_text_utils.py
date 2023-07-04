# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os
import zipfile

import datasets
import pandas as pd
from transformers import (AutoModelForSequenceClassification, AutoTokenizer,
                          pipeline)

from raiutils.common.retries import retry_function
from responsibleai_text.common.constants import QuestionAnsweringFields

try:
    from urllib import urlretrieve
except ImportError:
    from urllib.request import urlretrieve


ANSWERS = QuestionAnsweringFields.ANSWERS
CONTEXT = QuestionAnsweringFields.CONTEXT
QUESTION = QuestionAnsweringFields.QUESTION
QUESTIONS = QuestionAnsweringFields.QUESTIONS
TITLE = 'title'
EMOTION_DATASET = 'SetFit/emotion'
EMOTION = 'emotion'
COVID19_EVENTS_LABELS = ["event1", "event2", "event3", "event4",
                         "event5", "event6", "event7", "event8"]
COVID19_EVENTS_MODEL_NAME = "covid19_events_model"
BLBOOKSGENRE_MODEL_NAME = "blbooksgenre_model"
NUM_BLBOOKSGENRE_LABELS = 2
BLBOOKS_LABEL = 'label'


class TextClassificationPipelineSerializer(object):
    def save(self, model, path):
        model_path = self._get_model_path(path)
        model.save_pretrained(model_path)

    def load(self, path):
        model_path = self._get_model_path(path)
        return pipeline("text-classification", model=model_path)

    def _get_model_path(self, path):
        return os.path.join(path, 'text-classification-model')


class MultilabelTextClassificationSerializer(object):
    def save(self, model, path):
        pass

    def load(self, path):
        return create_multilabel_pipeline()


def load_emotion_dataset():
    dataset = datasets.load_dataset(EMOTION_DATASET, split="train")
    data = pd.DataFrame({'text': dataset['text'],
                         EMOTION: dataset['label']})
    return data


def load_squad_dataset(with_metadata=False):
    dataset = datasets.load_dataset("squad", split="train")
    answers = []
    questions = []
    context = []
    title = []
    for row in dataset:
        context.append(row[CONTEXT])
        questions.append(row[QUESTION])
        answers.append(row[ANSWERS]['text'][0])
        if with_metadata:
            title.append(row[TITLE])
    columns = {CONTEXT: context, QUESTIONS: questions, ANSWERS: answers}
    if with_metadata:
        columns.update({TITLE: title})
    data = pd.DataFrame(columns)
    return data


def load_covid19_emergency_event_dataset(with_metadata=False):
    dataset = datasets.load_dataset("joelito/covid19_emergency_event",
                                    split="train")
    columns = {"text": dataset["text"],
               "event1": dataset["event1"],
               "event2": dataset["event2"],
               "event3": dataset["event3"],
               "event4": dataset["event4"],
               "event5": dataset["event5"],
               "event6": dataset["event6"],
               "event7": dataset["event7"],
               "event8": dataset["event8"],
               "language": dataset["language"]}
    if with_metadata:
        columns.update({'country': dataset['country']})
    dataset = pd.DataFrame(columns)
    if not with_metadata:
        dataset = dataset[dataset.language == "en"].reset_index(drop=True)
        dataset = dataset.drop(columns="language")
    else:
        selected_languages = dataset.language.isin(["en", "es", "fr"])
        dataset = dataset[selected_languages].reset_index(drop=True)
    return dataset


def load_blbooks_genre_dataset():
    config_kwargs = {"name": "annotated_raw"}
    dataset = datasets.load_dataset("blbooksgenre", split="train",
                                    **config_kwargs)
    grouping_col = 'BL record ID'
    columns = {"text": dataset["Title"],
               BLBOOKS_LABEL: dataset["annotator_genre"],
               "Date of publication": dataset["Date of publication"],
               "annotator_country": dataset["annotator_country"],
               "annotator_place_pub": dataset["annotator_place_pub"],
               "annotated": dataset["annotated"],
               grouping_col: dataset[grouping_col]}
    dataset = pd.DataFrame(columns)
    # drop duplicate rows
    g = dataset.groupby(['BL record ID'])
    dataset = g.first().sort_index().reset_index().drop_duplicates()
    dataset = dataset[dataset.label != 1].reset_index(drop=True)
    dataset = dataset.drop(columns=grouping_col)
    print(dataset)
    return dataset


def create_text_classification_pipeline():
    # load the model and tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        "nateraw/bert-base-uncased-emotion", use_fast=True)
    model = AutoModelForSequenceClassification.from_pretrained(
        "nateraw/bert-base-uncased-emotion")

    # build a pipeline object to do predictions
    pred = pipeline("text-classification", model=model,
                    tokenizer=tokenizer, device=-1,
                    return_all_scores=True)
    return pred


def create_question_answering_pipeline():
    return pipeline('question-answering')


class FetchModel(object):
    def __init__(self, model_name):
        self.model_name = model_name

    def fetch(self):
        zipfilename = self.model_name + '.zip'
        url = ('https://publictestdatasets.blob.core.windows.net/models/' +
               self.model_name + '.zip')
        urlretrieve(url, zipfilename)
        with zipfile.ZipFile(zipfilename, 'r') as unzip:
            unzip.extractall(self.model_name)


def create_multilabel_pipeline():
    fetcher = FetchModel(COVID19_EVENTS_MODEL_NAME)
    action_name = "Model download"
    err_msg = "Failed to download model"
    max_retries = 4
    retry_delay = 60
    retry_function(fetcher.fetch, action_name, err_msg,
                   max_retries=max_retries,
                   retry_delay=retry_delay)
    labels = COVID19_EVENTS_LABELS
    num_labels = len(labels)
    id2label = {idx: label for idx, label in enumerate(labels)}
    label2id = {label: idx for idx, label in enumerate(labels)}
    model = AutoModelForSequenceClassification.from_pretrained(
        COVID19_EVENTS_MODEL_NAME, num_labels=num_labels,
        problem_type="multi_label_classification",
        id2label=id2label,
        label2id=label2id)
    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
    device = -1
    # build a pipeline object to do predictions
    pred = pipeline(
        "text-classification",
        model=model,
        tokenizer=tokenizer,
        device=device,
        return_all_scores=True
    )
    return pred


def create_blbooks_pipeline():
    fetcher = FetchModel(BLBOOKSGENRE_MODEL_NAME)
    action_name = "Model download"
    err_msg = "Failed to download model"
    max_retries = 4
    retry_delay = 60
    retry_function(fetcher.fetch, action_name, err_msg,
                   max_retries=max_retries,
                   retry_delay=retry_delay)
    model = AutoModelForSequenceClassification.from_pretrained(
        BLBOOKSGENRE_MODEL_NAME, num_labels=NUM_BLBOOKSGENRE_LABELS)
    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
    device = -1
    pred = pipeline(
        "text-classification",
        model=model,
        tokenizer=tokenizer,
        device=device,
        return_all_scores=True
    )
    return pred
