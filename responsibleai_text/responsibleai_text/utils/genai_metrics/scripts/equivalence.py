"""Groundedness metric."""

import datasets
import evaluate
import pandas as pd

logger = evaluate.logging.get_logger(__name__)


_CITATION = """
"""

_DESCRIPTION = """The equivalence metric.
"""

_KWARGS_DESCRIPTION = """
**SOME DESCRIPTION**
"""

_SYS_PROMPT = """
You are an AI assistant. You will be given the definition of an evaluation metric for assessing the quality of an answer in a question-answering task. Your job is to compute an accurate evaluation score using the provided evaluation metric.
Your response will be used in automated evaluation of question-answering systems, and must be an integer between 1 and 5, and nothing else.
""".strip()

_TEMPLATE = """
Equivalence, as a metric, measures the similarity between the predicted answer and the correct answer. If the information and content in the predicted answer is similar or equivalent to the correct answer, then the value of the Equivalence metric should be high, else it should be low. Given the question, correct answer, and predicted answer, determine the value of Equivalence metric using the following rating scale:
One star: the predicted answer is not at all similar to the correct answer
Two stars: the predicted answer is mostly not similar to the correct answer
Three stars: the predicted answer is somewhat similar to the correct answer
Four stars: the predicted answer is mostly similar to the correct answer
Five stars: the predicted answer is completely similar to the correct answer

This rating value should always be an integer between 1 and 5. So the rating produced should be 1 or 2 or 3 or 4 or 5.

QUESTION:
{question}

CORRECT ANSWER:
{answer}

PREDICTED ANSWER:
{prediction}
""".strip()


@evaluate.utils.file_utils.add_start_docstrings(_DESCRIPTION, _KWARGS_DESCRIPTION)
class Equivalence(evaluate.Metric):
    def _info(self):

        return evaluate.MetricInfo(
            description=_DESCRIPTION,
            citation=_CITATION,
            inputs_description=_KWARGS_DESCRIPTION,
            features=datasets.Features(
                {
                    "predictions": datasets.Value("string", id="sequence"),
                    "references": datasets.Value("string", id="sequence"),
                    "answers": datasets.Value("string", id="sequence")
                }
            ),
        )

    def _compute(self, *, predictions=None, references=None, **kwargs):
        m = []
        templated_ques = []

        answers = kwargs['answers']
        for p, r, a in zip(predictions, references, answers):
            templated_ques.append(_TEMPLATE.format(question=r, prediction=p, answer=a))

        model = kwargs['wrapper_model']

        inp = pd.DataFrame({
            'questions' : templated_ques,
            'sys_prompt' : _SYS_PROMPT})

        responses = model.predict(inp)

        for r in responses:
            try:
                m.append(int(r))
            except ValueError as e:
                logger.warning('Failed to parse metric `%s`: %s', r, e)
                m.append(0)
        return {'scores' : m}
            