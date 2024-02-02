# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Fluency metric."""

import logging

from responsibleai_text.utils.genai_metrics.constants import _CITATION
from responsibleai_text.utils.genai_metrics.scripts._compute import \
    _compute_metric

module_logger = logging.getLogger(__name__)
module_logger.setLevel(logging.INFO)

try:
    import evaluate
except ImportError:
    module_logger.debug(
        'Could not import evaluate, required if using a genai model')

try:
    import datasets
except ImportError:
    module_logger.debug(
        'Could not import datasets, required if using a genai model')

logger = evaluate.logging.get_logger(__name__)

_DESCRIPTION = """The fluency metric.
"""

_KWARGS_DESCRIPTION = """
**SOME DESCRIPTION**
"""

_TEMPLATE = """
Fluency measures the quality of individual sentences in the answer, and \
whether they are well-written and grammatically correct. Consider the quality \
of individual sentences when evaluating fluency. Given the question and \
answer, score the fluency of the answer between one to five stars using the \
following rating scale:
One star: the answer completely lacks fluency
Two stars: the answer mostly lacks fluency
Three stars: the answer is partially fluent
Four stars: the answer is mostly fluent
Five stars: the answer has perfect fluency

%s

QUESTION:
{question}

ANSWER:
{prediction}
""".strip()


@evaluate.utils.file_utils.add_start_docstrings(
    _DESCRIPTION, _KWARGS_DESCRIPTION)
class Fluency(evaluate.Metric):
    def _info(self):
        return evaluate.MetricInfo(
            description=_DESCRIPTION,
            citation=_CITATION,
            inputs_description=_KWARGS_DESCRIPTION,
            features=datasets.Features({
                "predictions": datasets.Value("string", id="sequence"),
                "references": datasets.Value("string", id="sequence")}))

    def _compute(self, *, predictions=None, references=None, **kwargs):
        return _compute_metric(
            _TEMPLATE,
            logger,
            kwargs['wrapper_model'],
            prediction=predictions,
            question=references)
