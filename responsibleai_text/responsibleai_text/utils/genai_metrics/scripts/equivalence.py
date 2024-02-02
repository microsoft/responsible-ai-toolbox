# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Equivalence metric."""

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

_DESCRIPTION = """The equivalence metric.
"""

_KWARGS_DESCRIPTION = """
**SOME DESCRIPTION**
"""

_TEMPLATE = """
Equivalence, as a metric, measures the similarity between the predicted \
answer and the correct answer. If the information and content in the \
predicted answer is similar or equivalent to the correct answer, then the \
value of the Equivalence metric should be high, else it should be low. Given \
the question, correct answer, and predicted answer, determine the value of \
Equivalence metric using the following rating scale:
One star: the predicted answer is not at all similar to the correct answer
Two stars: the predicted answer is mostly not similar to the correct answer
Three stars: the predicted answer is somewhat similar to the correct answer
Four stars: the predicted answer is mostly similar to the correct answer
Five stars: the predicted answer is completely similar to the correct answer

%s

QUESTION:
{question}

CORRECT ANSWER:
{answer}

PREDICTED ANSWER:
{prediction}
""".strip()


@evaluate.utils.file_utils.add_start_docstrings(
    _DESCRIPTION, _KWARGS_DESCRIPTION)
class Equivalence(evaluate.Metric):
    def _info(self):
        return evaluate.MetricInfo(
            description=_DESCRIPTION,
            citation=_CITATION,
            inputs_description=_KWARGS_DESCRIPTION,
            features=datasets.Features({
                "predictions": datasets.Value("string", id="sequence"),
                "references": datasets.Value("string", id="sequence"),
                "answers": datasets.Value("string", id="sequence")}))

    def _compute(self, *, predictions=None, references=None, **kwargs):
        return _compute_metric(
            _TEMPLATE,
            logger,
            kwargs['wrapper_model'],
            prediction=predictions,
            question=references,
            answer=kwargs['answers'])
