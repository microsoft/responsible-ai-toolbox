# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Coherence metric."""

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

_DESCRIPTION = """The coherence metric.
"""

_KWARGS_DESCRIPTION = """
**SOME DESCRIPTION**
"""

_TEMPLATE = """
Coherence of an answer is measured by how well all the sentences fit together \
and sound naturally as a whole. Consider the overall quality of the answer \
when evaluating coherence. Given the question and answer, score the coherence \
of answer between one to five stars using the following rating scale:
One star: the answer completely lacks coherence
Two stars: the answer mostly lacks coherence
Three stars: the answer is partially coherent
Four stars: the answer is mostly coherent
Five stars: the answer has perfect coherency

%s

QUESTION:
{question}

ANSWER:
{prediction}

RATING:
""".strip()


@evaluate.utils.file_utils.add_start_docstrings(
    _DESCRIPTION, _KWARGS_DESCRIPTION)
class Coherence(evaluate.Metric):
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
