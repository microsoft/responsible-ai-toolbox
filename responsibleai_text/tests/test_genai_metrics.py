# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from responsibleai_text.utils.genai_metrics.metrics import get_genai_metric

PREDICTIONS = ['This is a prediction']
REFERENCES = ['This is a reference']
ANSWERS = ['This is an answer']


class DummyModelWrapper:
    def predict(self, inp):
        return [1] * len(inp)


class TestGenAIMetrics:

    def test_coherence(self):
        metric = get_genai_metric('coherence',
                                  predictions=PREDICTIONS,
                                  references=REFERENCES,
                                  wrapper_model=DummyModelWrapper())
        assert metric['scores'] == [1]

        metric = get_genai_metric('coherence',
                                  predictions=PREDICTIONS * 5,
                                  references=REFERENCES * 5,
                                  wrapper_model=DummyModelWrapper())
        assert metric['scores'] == [1] * 5

    def test_equivalence(self):
        metric = get_genai_metric('equivalence',
                                  predictions=PREDICTIONS,
                                  references=REFERENCES,
                                  answers=ANSWERS,
                                  wrapper_model=DummyModelWrapper())
        assert metric['scores'] == [1]

        metric = get_genai_metric('equivalence',
                                  predictions=PREDICTIONS * 5,
                                  references=REFERENCES * 5,
                                  answers=ANSWERS * 5,
                                  wrapper_model=DummyModelWrapper())
        assert metric['scores'] == [1] * 5

    def test_fluency(self):
        metric = get_genai_metric('fluency',
                                  predictions=PREDICTIONS,
                                  references=REFERENCES,
                                  wrapper_model=DummyModelWrapper())
        assert metric['scores'] == [1]

        metric = get_genai_metric('fluency',
                                  predictions=PREDICTIONS * 5,
                                  references=REFERENCES * 5,
                                  wrapper_model=DummyModelWrapper())
        assert metric['scores'] == [1] * 5

    def test_groundedness(self):
        metric = get_genai_metric('groundedness',
                                  predictions=PREDICTIONS,
                                  references=REFERENCES,
                                  wrapper_model=DummyModelWrapper())
        assert metric['scores'] == [1]

        metric = get_genai_metric('groundedness',
                                  predictions=PREDICTIONS * 5,
                                  references=REFERENCES * 5,
                                  wrapper_model=DummyModelWrapper())
        assert metric['scores'] == [1] * 5

    def test_relevance(self):
        metric = get_genai_metric('relevance',
                                  predictions=PREDICTIONS,
                                  references=REFERENCES,
                                  wrapper_model=DummyModelWrapper())
        assert metric['scores'] == [1]

        metric = get_genai_metric('relevance',
                                  predictions=PREDICTIONS * 5,
                                  references=REFERENCES * 5,
                                  wrapper_model=DummyModelWrapper())
        assert metric['scores'] == [1] * 5
