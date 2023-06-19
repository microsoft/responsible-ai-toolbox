# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum


class ModelTask(str, Enum):
    """Provide model task constants.

    Can be 'text_classification', 'sentiment_analysis',
    'question_answering', 'entailment', 'summarizations'
    or 'unknown'.
    """

    TEXT_CLASSIFICATION = 'text_classification'
    MULTILABEL_TEXT_CLASSIFICATION = 'multilabel_text_classification'
    SENTIMENT_ANALYSIS = 'sentiment_analysis'
    QUESTION_ANSWERING = 'question_answering'
    ENTAILMENT = 'entailment'
    SUMMARIZATIONS = 'summarizations'
    UNKNOWN = 'unknown'


class Tokens(object):
    """Provide tokens related to text processing."""

    SEP = "[SEP]"


class QuestionAnsweringFields(object):
    """Provide fields related to question answering task."""

    QUESTIONS = "questions"
    QUESTION = "question"
    CONTEXT = "context"
    ANSWERS = "answers"
