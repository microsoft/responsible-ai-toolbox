# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import gender_guesser.detector as gender
import pkg_resources
from negspacy.negation import Negex  # noqa: F401

from raiutils.dataset import fetch_dataset

POSITIVE_NEGATIVE_FILE = 'positive-negative.csv'

resource_package = __name__
nlp_url = 'https://publictestdatasets.blob.core.windows.net/nlp/'
fetch_dataset(nlp_url + POSITIVE_NEGATIVE_FILE, POSITIVE_NEGATIVE_FILE)
male_words_path = '/'.join(('data', 'male-words.txt'))
female_words_path = '/'.join(('data', 'female-words.txt'))
neutral_words_path = '/'.join(('data', 'neutral-words.txt'))
male_words_data = pkg_resources.resource_string(
    resource_package, male_words_path).decode("utf-8")
female_words_data = pkg_resources.resource_string(
    resource_package, female_words_path).decode("utf-8")
neutral_words_data = pkg_resources.resource_string(
    resource_package, neutral_words_path).decode("utf-8")

with open(POSITIVE_NEGATIVE_FILE, 'r', encoding='utf8') as pnf:
    positive_negative_raw = pnf.read()

positive_negative_lines = positive_negative_raw.split("\n")

positive_words = set()
negative_words = set()
for line in positive_negative_lines[2:]:
    words = list(map(lambda w: w.strip(), line.split(",")))
    if len(words[1]) > 0:
        negative_words.add(words[1])

    if len(words[2]) > 0:
        positive_words.add(words[2])

male_words_raw = male_words_data
male_words = set(
    filter(
        lambda w: len(w) > 0,
        map(lambda w: w.strip(), male_words_raw.split("\n"))))

female_words_raw = female_words_data
female_words = set(
    filter(
        lambda w: len(w) > 0,
        map(lambda w: w.strip(), female_words_raw.split("\n"))))

neutral_words_raw = neutral_words_data
neutral_words = set(filter(
    lambda w: len(w) > 0,
    map(lambda w: w.strip(), neutral_words_raw.split("\n"))))


def positive_negative_word_count(nlp_doc):
    positive_count = 0
    negative_count = 0
    for token in nlp_doc:
        if token.lemma_ in positive_words or token.text in positive_words:
            positive_count += 1
        elif token.lemma_ in negative_words or token.text in negative_words:
            negative_count += 1

    return {
        "positive_word_count": positive_count,
        "negative_word_count": negative_count}


def get_named_persons(nlp_doc):
    return list(map(
        lambda tok: tok.text,
        filter(lambda tok: tok.label_ == "PERSON", nlp_doc.ents)))


def get_named_locations(nlp_doc):
    return list(map(
        lambda tok: tok.text,
        filter(lambda tok: tok.label_ in ["LOC", "FAC"], nlp_doc.ents)))


def get_dates(nlp_doc):
    return list(map(
        lambda tok: tok.text,
        filter(lambda tok: tok.label_ == "DATE", nlp_doc.ents)))


def get_non_date_numerics(nlp_doc):
    return list(map(
        lambda tok: tok.text,
        filter(
            lambda tok: tok.label_ in [
                "TIME", "PERCENT", "MONEY",
                "QUANTITY", "ORDINAL", "CARDINAL"],
            nlp_doc.ents)))


def get_all_named_entities(nlp_doc):
    return list(map(lambda tok: tok.text, nlp_doc.ents))


def is_noun_phrase(nlp_doc):
    return (len(list(nlp_doc.noun_chunks)) == 1)


def get_dependency_tree_tokens(root_token):
    dependency_tree_tokens = list()
    token_queue = [root_token]
    while len(token_queue) > 0:
        token = token_queue[0]
        dependency_tree_tokens.append(token.text)
        token_queue = token_queue[1:]
        for child in token.children:
            token_queue.append(child)

    return dependency_tree_tokens


def is_adjective_phrase(nlp_doc):
    adjectives = list(filter(lambda tok: tok.pos_ == "ADJ", nlp_doc))
    for adjective in adjectives:
        dep_tree_tokens = get_dependency_tree_tokens(adjective)
        if len(dep_tree_tokens) == len(nlp_doc):
            return True

    return False


def is_verb_phrase(nlp_doc):
    adjectives = list(filter(lambda tok: tok.pos_ == "VERB", nlp_doc))
    for adjective in adjectives:
        dep_tree_tokens = get_dependency_tree_tokens(adjective)
        if len(dep_tree_tokens) == len(nlp_doc):
            return True

    return False


def get_sub_sentences(sentence):
    sub_sentences = sentence.split(";")

    return sub_sentences


def detect_sub_sentences_with_different_sentiments(classify_helper, sentence):
    sub_sentences = get_sub_sentences(sentence)
    sentiments = set(classify_helper(sub_sentences))

    if len(sentiments) == 1:
        return False

    return True


def get_male_female_words_count(nlp_doc):
    gender_detector = gender.Detector()
    male_count = 0
    female_count = 0
    neutral_count = 0
    for token in nlp_doc:
        if token.text in male_words or token.lemma_ in male_words:
            male_count += 1
        elif token.text in female_words or token.lemma_ in female_words:
            female_count += 1
        elif token.text in neutral_words or token.lemma_ in neutral_words:
            neutral_count += 1

    for name in get_named_persons(nlp_doc):
        if gender_detector.get_gender(name) in ["male", "mostly_male"]:
            male_count += 1
        elif gender_detector.get_gender(name) == ["female", "mostly_female"]:
            female_count += 1
        elif gender_detector.get_gender(name) == ["andy", "unknown"]:
            neutral_count += 1

    return {
        "male_count": male_count,
        "female_count": female_count,
        "neutral_count": neutral_count}


def detect_negation_words_and_entities(nlp_doc):
    negation_tokens = list(filter(lambda tok: tok.dep_ == "neg", nlp_doc))
    negated_entities = list(filter(lambda tok: tok._.negex, nlp_doc.ents))
    return {
        "negation_words": len(negation_tokens),
        "negated_entities": len(negated_entities)}


def dependency_parse_tree_depth(doc):
    # Assumes that we hae one sentence
    sent = next(doc.sents)
    root = sent.root
    depth = 0
    queue = [(root, 0)]
    while len(queue) > 0:
        node, d = queue[0]
        depth = d
        queue = queue[1:]
        for child in node.children:
            queue.append((child, d + 1))

    return depth
