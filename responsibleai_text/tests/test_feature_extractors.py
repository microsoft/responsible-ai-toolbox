# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import spacy
from negspacy.termsets import termset

from responsibleai_text.utils.feature_extractors import (get_context_overlap,
                                                         get_question_type)

nlp = spacy.load("en_core_web_sm")
ts = termset("en")
nlp.add_pipe("negex", config={"neg_termset": ts.get_patterns()})


class TestFeatureExtractors(object):

    def test_question_type_extractor(self):
        # part of questions are from SQuAD 2.0 dev set article: Steam_engine
        test_data = [
            {"question":
             "On what date did the first railway trip in the world occur?",
             "type": "WHEN"},
            {"question":
             "When were attempts made to overcome stationary marketplaces?",
             "type": "WHEN"},
            {"question":
             "What year saw the earliest recorded use of the " +
             "steam engine indicator?",
             "type": "WHEN"},
            {"question":
             "Where did the world's first railway journey terminate?",
             "type": "WHERE"},
            {"question":
             "How many expansion stages are used by the triple " +
             "expansion engine?",
             "type": "NUMBER"},
            {"question":
             "Who was the inventor of the atmospheric engine?",
             "type": "WHO"},
            {"question":
             "What types of engines are steam engines?",
             "type": "WHAT"},
            {"question":
             "What's another term for the pivot mounting?",
             "type": "WHAT"},
            {"question":
             "Why the Rankine cycle is often used as a bottoming cycle?",
             "type": "WHY"},
            {"question":
             "Will this extractor work as expected?",
             "type": "YES/NO"},
            {"question": "Any questions?", "type": "OTHER"},
        ]
        for data in test_data:
            assert data["type"] == get_question_type(data["question"])

    def test_context_overlap_extractor(self):
        # from SQuAD 2.0 dev set article: Steam_engine
        test_context = '''
            Steam engines are external combustion engines,
            where the working fluid is separate from the
            combustion products.
            Non-combustion heat sources such as solar power,
            nuclear power or geothermal energy may be used.
            The ideal thermodynamic cycle used to analyze this
            process is called the Rankine cycle.
            In the cycle, water is heated and transforms into steam
            within a boiler operating at a high pressure.
            When expanded through pistons or turbines, mechanical
            work is done.
            The reduced-pressure steam is then condensed and pumped
            back into the boiler.
        '''

        test_data = [
            {
                "question":
                "At what pressure is water heated in the Rankine cycle?",
                "context_overlap": 1.0
            },
            {"question": "What types of engines are steam engines?",
             "context_overlap": 0.667},
            {"question":
             "Which part of the immune system protects the brain?",
             "context_overlap": 0.0},
        ]

        for data in test_data:
            context_overlap = get_context_overlap(
                test_context, data["question"])
            assert data["context_overlap"] == context_overlap
