# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Constants for genai_metrics."""

_CITATION = """
"""

_SYS_PROMPT = """
You are an AI assistant. You will be given the definition of an evaluation \
metric for assessing the quality of an answer in a question-answering task. \
Your job is to compute an accurate evaluation score using the provided \
evaluation metric.
Your response will be used in automated evaluation of question-answering \
systems, and must be an integer between 1 and 5, and nothing else.
""".strip()

_EXAMPLES = """
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
""".strip()
