# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Relevance metric."""

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

_DESCRIPTION = """The relevance metric.
"""

_KWARGS_DESCRIPTION = """
**SOME DESCRIPTION**
"""

_TEMPLATE = """
Relevance measures how well the answer addresses the main aspects of the \
question, based on the context. Consider whether all and only the important \
aspects are contained in the answer when evaluating relevance. Given the \
context and question, score the relevance of the answer between one to five \
stars using the following rating scale:
One star: the answer completely lacks relevance
Two stars: the answer mostly lacks relevance
Three stars: the answer is partially relevant
Four stars: the answer is mostly relevant
Five stars: the answer has perfect relevance

%s

QUESTION AND CONTEXT:
{question}

ANSWER:
{prediction}
""".strip()


@evaluate.utils.file_utils.add_start_docstrings(
    _DESCRIPTION, _KWARGS_DESCRIPTION)
class Relevance(evaluate.Metric):
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
