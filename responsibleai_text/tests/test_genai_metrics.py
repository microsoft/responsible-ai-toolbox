# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from responsibleai_text.utils.genai_metrics.metrics import (
    get_genai_metric, get_genai_metric_mean)

PREDICTIONS = ['This is a prediction']
REFERENCES = ['This is a reference']
ANSWERS = ['This is an answer']


class DummyModelWrapper:
    def predict(self, inp):
        return [1] * len(inp)


class TestGenAIMetrics:

    def assert_metrics(self, metric_name,
                       expected, input_len,
                       **metric_kwargs):
        metric = get_genai_metric(metric_name, **metric_kwargs,
                                  wrapper_model=DummyModelWrapper())
        assert metric['scores'] == [expected]

        metric_mean = get_genai_metric_mean(metric_name, **metric_kwargs,
                                            wrapper_model=DummyModelWrapper())
        assert metric_mean == expected

        kwargs_multi = {k: v * input_len for k, v in metric_kwargs.items()}
        metric_multi = get_genai_metric(metric_name, **kwargs_multi,
                                        wrapper_model=DummyModelWrapper())
        assert metric_multi['scores'] == [expected] * input_len

        metric_mean_multi = get_genai_metric_mean(
            metric_name, **kwargs_multi, wrapper_model=DummyModelWrapper())
        assert metric_mean_multi == expected

    def test_coherence(self):
        self.assert_metrics('coherence', 1, 5,
                            predictions=PREDICTIONS,
                            references=REFERENCES)

    def test_equivalence(self):
        self.assert_metrics('equivalence', 1, 5,
                            predictions=PREDICTIONS,
                            references=REFERENCES,
                            answers=ANSWERS)

    def test_fluency(self):
        self.assert_metrics('fluency', 1, 5,
                            predictions=PREDICTIONS,
                            references=REFERENCES)

    def test_groundedness(self):
        self.assert_metrics('groundedness', 1, 5,
                            predictions=PREDICTIONS,
                            references=REFERENCES)

    def test_relevance(self):
        self.assert_metrics('relevance', 1, 5,
                            predictions=PREDICTIONS,
                            references=REFERENCES)
