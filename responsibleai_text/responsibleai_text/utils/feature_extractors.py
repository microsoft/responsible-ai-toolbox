# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the text feature extraction utilities."""

import re
from typing import List, Optional, Union

import pandas as pd
import spacy
from negspacy.termsets import termset
from tqdm import tqdm

from nlp_feature_extractors import attribute_extractors as exts
from responsibleai_text.common.constants import (ModelTask,
                                                 QuestionAnsweringFields)

nlp = None


def extract_features(text_dataset: pd.DataFrame,
                     target_column: Union[str, List], task_type: str,
                     dropped_features: Optional[List[str]] = None):
    '''Extract tabular data features from the text dataset.

    :param text_dataset: A pandas dataframe containing the text data.
    :type text_dataset: pandas.DataFrame
    :param target_column: The name of the label column or list of columns.
            This is a list of columns for multilabel models.
    :type target_column: str or list[str]
    :param task_type: The type of task to be performed.
    :type task_type: str
    :param dropped_features: The list of features to be dropped.
    :type dropped_features: list[str]
    :return: The list of extracted features and the feature names.
    :rtype: list, list
    '''
    results = []
    base_feature_names = ["positive_words", "negative_words",
                          "negation_words", "negated_entities",
                          "named_persons", "sentence_length"]
    single_text_col_tasks = [ModelTask.TEXT_CLASSIFICATION,
                             ModelTask.MULTILABEL_TEXT_CLASSIFICATION]
    has_dropped_features = dropped_features is not None
    start_meta_index = 2
    column_names = text_dataset.columns
    if isinstance(target_column, list):
        start_meta_index = len(target_column) + 1
    if task_type in single_text_col_tasks:
        feature_names = base_feature_names
    elif task_type == ModelTask.QUESTION_ANSWERING:
        start_meta_index += 1
        feature_names = []
        prefixes = [QuestionAnsweringFields.CONTEXT + "_",
                    QuestionAnsweringFields.QUESTION + "_"]
        for prefix in prefixes:
            for feature_name in base_feature_names:
                feature_names.append(prefix + feature_name)
            feature_names.append(prefix + "average_parse_tree_depth")
            feature_names.append(prefix + "maximum_parse_tree_depth")
        feature_names.append("question_type")
        feature_names.append("context_overlap")
    else:
        raise ValueError("Unknown task type: {}".format(task_type))
    # copy over the metadata column names
    for j in range(start_meta_index, text_dataset.shape[1]):
        if has_dropped_features and column_names[j] in dropped_features:
            continue
        feature_names.append(column_names[j])
    if not isinstance(target_column, list):
        target_column = [target_column]
    text_features = text_dataset.drop(target_column, axis=1)

    if task_type in single_text_col_tasks:
        sentences = text_features.iloc[:, 0].tolist()
        for i, sentence in tqdm(enumerate(sentences)):
            extracted_features = []
            add_extracted_features_for_sentence(sentence, extracted_features)
            # append all other metadata features
            append_metadata_values(start_meta_index, text_dataset, i,
                                   extracted_features, has_dropped_features,
                                   dropped_features, column_names)
            results.append(extracted_features)
    elif task_type == ModelTask.QUESTION_ANSWERING:
        for i, row in tqdm(text_features.iterrows()):
            extracted_features = []
            add_extracted_features_for_sentence(
                row[QuestionAnsweringFields.CONTEXT], extracted_features,
                task_type)
            add_extracted_features_for_sentence(
                row[QuestionAnsweringFields.QUESTIONS], extracted_features,
                task_type, sentence_type="QUESTION")

            context = row[QuestionAnsweringFields.CONTEXT]
            question = row[QuestionAnsweringFields.QUESTIONS]
            context_overlap = get_context_overlap(context=context,
                                                  question=question)
            extracted_features.append(context_overlap)
            # append all other metadata features
            append_metadata_values(start_meta_index, text_dataset, i,
                                   extracted_features, has_dropped_features,
                                   dropped_features, column_names)
            results.append(extracted_features)
    else:
        raise ValueError("Unknown task type: {}".format(task_type))
    return results, feature_names


def append_metadata_values(start_meta_index, text_dataset, i,
                           extracted_features, has_dropped_features,
                           dropped_features, column_names):
    """Append the metadata values to the extracted features.

    Note this also modifies the input array in-place.

    :param start_meta_index: The index of the first metadata column.
    :type start_meta_index: int
    :param text_dataset: The text dataset.
    :type text_dataset: pandas.DataFrame
    :param i: The index of the current row.
    :type i: int
    :param extracted_features: The list of extracted features.
    :type extracted_features: list
    :param has_dropped_features: Whether there are dropped features.
    :type has_dropped_features: bool
    :param dropped_features: The list of dropped features.
    :type dropped_features: list
    :param column_names: The list of column names.
    :type column_names: list
    :return: The list of extracted features.
    :rtype: list
    """
    # append all other metadata features
    for j in range(start_meta_index, text_dataset.shape[1]):
        if has_dropped_features and column_names[j] in dropped_features:
            continue
        extracted_features.append(text_dataset.iloc[i][j])
    return extracted_features


def get_text_columns(text_dataset: pd.DataFrame,
                     text_column: Optional[Union[str, List]]):
    """Get the text columns for prediction.

    :param text_dataset: The text dataset.
    :type text_dataset: pd.DataFrame
    :param text_column: The name of the text column or list of columns.
    :type text_column: str or list[str]
    :return: The text columns for prediction.
    :rtype: pd.DataFrame
    """
    text_exists = not not text_column
    num_cols = len(text_dataset.columns)
    is_list = isinstance(text_column, list)
    text_cols = len(text_column) if is_list else 1
    # Drop metadata columns before calling predict
    if text_exists and num_cols - text_cols > 0:
        if not is_list:
            text_column = [text_column]
        text_dataset = text_dataset[text_column]
    return text_dataset


def add_extracted_features_for_sentence(sentence, extracted_features,
                                        task_type=None, sentence_type=None):
    """Add the extracted features for a sentence.

    Note this also modifies the input array in-place.

    :param sentence: The sentence to extract features from.
    :type sentence: str
    :param extracted_features: The list of extracted features.
    :type extracted_features: list
    :param task_type: The type of task to be performed.
    :type task_type: str
    :param sentence_type: The type of sentence to be processed.
    :type sentence_type: str
    :return: The list of extracted features.
    :rtype: list
    """
    global nlp
    if nlp is None:
        nlp = spacy.load("en_core_web_sm")
        ts = termset("en")
        nlp.add_pipe("negex", config={"neg_termset": ts.get_patterns()})
    doc = nlp(sentence)
    positive_negative_count = exts.positive_negative_word_count(doc)
    named_persons = exts.get_named_persons(doc)
    neg_words_and_entities = exts.detect_negation_words_and_entities(doc)
    sentence_length = len(sentence)
    features = [positive_negative_count["positive_word_count"],
                positive_negative_count["negative_word_count"],
                neg_words_and_entities["negation_words"],
                neg_words_and_entities["negated_entities"],
                len(named_persons),
                sentence_length]

    if task_type == ModelTask.QUESTION_ANSWERING:

        features.append(get_average_depth(doc))
        features.append(get_max_depth(doc))

    if sentence_type == 'QUESTION':
        question_type = get_question_type(sentence)
        features.append(question_type)

    # TODO: This extractor seems to be very slow:
    # mf_count = exts.get_male_female_words_count(doc)

    extracted_features.extend(features)


def get_question_type(qtext):
    """Get the question type.

    :param qtext: The question text.
    :type qtext: str
    :return: The question type.
    :rtype: str
    """
    if re.search(r'\b\A(can|could|will|would|have|has' +
                 r'|do|does|did|is|are|was|may|might)\s', qtext, re.I):
        return "YES/NO"
    elif re.search(r'\b\A(what|which)(\'s|\'re)?\s+(\w+)', qtext, re.I):
        nextword = re.search(r'\b\A(what|which)(\'s|\'re)?\s+(\w+)',
                             qtext, re.I).group(3)
        if nextword in ["year", "month", "date", "day"]:
            return "WHEN"
        else:
            return "WHAT"
    elif re.search(r'\bwho(\'s|\'re)?\s', qtext, re.I):
        return "WHO"
    elif re.search(r'\bwhy(\'s|\'re)?\s', qtext, re.I):
        return "WHY"
    elif re.search(r'\bwhere(\'s|\'re)?\s', qtext, re.I):
        return "WHERE"
    elif re.search(r'\bhow(\'s|\'re)?\s', qtext, re.I):
        nextword = re.search(r'\b(how)(\'s|\'re)?\s(\w+)',
                             qtext, re.I).group(3)
        if nextword in ["many", "much", "long", "old", "often"]:
            return "NUMBER"
        else:
            return "HOW"
    elif re.search(r'\bwhen(\'s|\'re)?\s', qtext, re.I):
        return "WHEN"
    elif re.search(r'\b(in|on|at|by|for|to|from|during|within)' +
                   r'\s+(what|which)\s+(year|month|day|date|time)\s',
                   qtext, re.I):
        return "WHEN"
    elif re.search(r'\bto\swhom\s', qtext, re.I):
        return "WHO"
    else:
        return "OTHER"


def get_parse_tree_depth(root):
    """Get the parse tree depth.

    :param root: The root of the parse tree.
    :type root: spacy.tokens.token.Token
    :return: The parse tree depth.
    :rtype: int
    """
    if not list(root.children):
        return 1
    else:
        return 1 + max(get_parse_tree_depth(x) for x in root.children)


def get_average_depth(doc):
    """Get the average parse tree depth.

    :param doc: The document to process.
    :type doc: spacy.tokens.doc.Doc
    :return: The average parse tree depth.
    :rtype: float
    """
    roots = []
    for each in doc.sents:
        roots.append([token for token in each if token.head == token][0])

    parse_tree_depths = [get_parse_tree_depth(root) for root in roots]

    return sum(parse_tree_depths) / len(parse_tree_depths)


def get_max_depth(doc):
    """Get the maximum parse tree depth.

    :param doc: The document to process.
    :type doc: spacy.tokens.doc.Doc
    :return: The maximum parse tree depth.
    :rtype: int
    """
    roots = []
    for each in doc.sents:
        roots.append([token for token in each if token.head == token][0])

    return max([get_parse_tree_depth(root) for root in roots])


def is_base_token(token):
    """Check if the token is a base token.

    :param token: The token.
    :type token: spacy.tokens.token.Token
    :return: True if the token is a base token, False otherwise.
    :rtype: bool
    """
    return not token.is_stop and not token.is_punct


def get_context_overlap(context, question):
    """Get the context overlap.

    :param context: The context.
    :type context: str
    :param question: The question.
    :type question: str
    :return: The context overlap.
    :rtype: float
    """
    global nlp
    if nlp is None:
        nlp = spacy.load("en_core_web_sm")

    doc_q = nlp(question)
    doc_c = nlp(context)

    # get tokens in base form
    tokens_q = set([token.lemma_ for token in doc_q if is_base_token(token)])
    tokens_c = set([token.lemma_ for token in doc_c if is_base_token(token)])

    intersection = tokens_q.intersection(tokens_c)

    # size of intersection token set / size of question token set
    overlap_ratio = len(intersection) / len(tokens_q)

    return round(overlap_ratio, 3)
