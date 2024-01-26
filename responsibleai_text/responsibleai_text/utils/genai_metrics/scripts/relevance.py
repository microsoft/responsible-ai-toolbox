"""Groundedness metric."""

import datasets
import evaluate
import pandas as pd

logger = evaluate.logging.get_logger(__name__)


_CITATION = """
"""

_DESCRIPTION = """The relevance metric.
"""

_KWARGS_DESCRIPTION = """
**SOME DESCRIPTION**
"""

_SYS_PROMPT = """
You are an AI assistant. You will be given the definition of an evaluation \
metric for assessing the quality of an answer in a question-answering task. \
Your job is to compute an accurate evaluation score using the provided \
evaluation metric.
Your response will be used in automated evaluation of question-answering \
systems, and must be an integer between 1 and 5, and nothing else.
""".strip()

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

This rating value should always be an integer between 1 and 5. So the rating \
produced should be 1 or 2 or 3 or 4 or 5.

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
            features=datasets.Features(
                {
                    "predictions": datasets.Value("string", id="sequence"),
                    "references": datasets.Value("string", id="sequence")
                }
            ),
        )

    def _compute(self, *, predictions=None, references=None, **kwargs):
        m = []
        templated_ques = []

        for p, r in zip(predictions, references):
            templated_ques.append(_TEMPLATE.format(question=r, prediction=p))

        model = kwargs['wrapper_model']

        inp = pd.DataFrame({
            'questions': templated_ques,
            'sys_prompt': _SYS_PROMPT})

        responses = model.predict(inp)

        for r in responses:
            try:
                m.append(int(r))
            except ValueError as e:
                logger.warning('Failed to parse metric `%s`: %s', r, e)
                m.append(0)
        return {'scores': m}
