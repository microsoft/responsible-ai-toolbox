# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Helper function to compute metrics."""

import pandas as pd

from responsibleai_text.utils.genai_metrics.constants import (_EXAMPLES,
                                                              _SYS_PROMPT)


def format_str(s, **kwargs):
    """Zip all the kwargs together and format the string in a loop"""
    keys = list(kwargs.keys())
    lists = [kwargs[k] for k in keys]
    formatted = []
    for vals in zip(*lists):
        fmt_kwargs = {k: v for k, v in zip(keys, vals)}
        formatted.append(s.format(**fmt_kwargs))
    return formatted


def _compute_metric(template, logger, wrapper_model, **kwargs):
    m = []
    template = template % _EXAMPLES
    templated_ques = format_str(template, **kwargs)

    inp = pd.DataFrame({
        'prompt': templated_ques,
        'sys_prompt': _SYS_PROMPT})

    responses = wrapper_model.predict(inp)

    for r in responses:
        try:
            m.append(int(r))
        except ValueError as e:
            logger.warning('Failed to parse metric `%s`: %s', r, e)
            m.append(0)
    return {'scores': m}
