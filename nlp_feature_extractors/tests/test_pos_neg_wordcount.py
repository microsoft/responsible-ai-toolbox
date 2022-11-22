# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import spacy
from negspacy.termsets import termset
from sklearn.datasets import fetch_20newsgroups

from nlp_feature_extractors.attribute_extractors import \
    positive_negative_word_count

DOC_SAMPLE_COUNT = 50


class TestPosNegWordCount(object):

    def test_pos_neg_wordcount(self):
        remove = ('headers', 'footers', 'quotes')
        categories = ['alt.atheism', 'talk.religion.misc',
                      'comp.graphics', 'sci.space']
        ngroups = fetch_20newsgroups(
            subset='train', categories=categories, shuffle=True,
            random_state=42, remove=remove).data
        nlp = spacy.load("en_core_web_sm")
        ts = termset("en")
        nlp.add_pipe("negex", config={"neg_termset":
                                      ts.get_patterns()})
        first_doc = True
        for ngroup in ngroups[:DOC_SAMPLE_COUNT]:
            doc = nlp(ngroup)
            counts = positive_negative_word_count(doc)
            if first_doc:
                assert counts['positive_word_count'] == 30
                assert counts['negative_word_count'] == 1
                first_doc = False
            else:
                assert counts['positive_word_count'] >= 0
                assert counts['negative_word_count'] >= 0
