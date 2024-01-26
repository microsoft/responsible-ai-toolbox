"""Groundedness metric."""

import datasets
import evaluate
import pandas as pd

logger = evaluate.logging.get_logger(__name__)


_CITATION = """
"""

_DESCRIPTION = """The coherence metric.
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
Coherence of an answer is measured by how well all the sentences fit together \
and sound naturally as a whole. Consider the overall quality of the answer \
when evaluating coherence. Given the question and answer, score the coherence \
of answer between one to five stars using the following rating scale:
One star: the answer completely lacks coherence
Two stars: the answer mostly lacks coherence
Three stars: the answer is partially coherent
Four stars: the answer is mostly coherent
Five stars: the answer has perfect coherency

This rating value should always be an integer between 1 and 5. So the rating \
produced should be 1 or 2 or 3 or 4 or 5.
Some examples of valid responses are:
1
2
5
Some examples of invalid responses are:
1/5
1.5
3.0
5 stars

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
