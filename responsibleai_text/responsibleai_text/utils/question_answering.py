# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines utilities for question answering text scenario."""

import logging

from responsibleai_text.common.constants import Tokens

module_logger = logging.getLogger(__name__)
module_logger.setLevel(logging.INFO)


try:
    import torch
except ImportError:
    module_logger.debug(
        'Could not import torch, required if using a pytorch model')

SEP = Tokens.SEP


class QAPredictor:
    def __init__(self, qa_model):
        """Initialize the Question Answering predictor.

        :param qa_model: The question answering model.
        :type qa_model: QuestionAnsweringModel
        """
        self._qa_model = qa_model

    def predict_qa(self, questions, start):
        """Define predictions outputting the logits for range start and end.

        :param questions: The questions and context to predict on.
        :type questions: list[str]
        :param start: Whether to predict the start of the range.
        :type start: bool
        :return: The logits for the start and end of the range.
        :rtype: list[list[float]]
        """
        outs = []
        out_shape = None
        for q in questions:
            question, context = q.split(SEP)
            d = self._qa_model.tokenizer(question, context)
            device = self._qa_model.device
            out = self._qa_model.model.forward(
                **{k: torch.tensor(
                    d[k], device=device).reshape(1, -1) for k in d})
            logits = out.start_logits if start else out.end_logits
            out = logits.reshape(-1).detach().cpu().numpy()
            # shapes must match for mini batch, otherwise shap will error out
            # masking can produce different shapes in certain cases for some
            # models and tokenizers
            if out_shape is None:
                out_shape = out.shape[0]
            else:
                if out_shape != out.shape[0]:
                    if out.shape[0] < out_shape:
                        out_shape = out.shape[0]
                        for i in range(len(outs)):
                            outs[i] = outs[i][:out_shape]
                    out = out[:out_shape]
            outs.append(out)
        return outs

    def predict_qa_start(self, questions):
        """Define predictions outputting the logits for the start of the range.

        :param questions: The questions and context to predict on.
        :type questions: list[str]
        :return: The logits for the start of the range.
        :rtype: list[list[float]]
        """
        return self.predict_qa(questions, True)

    def predict_qa_end(self, questions):
        """Define predictions outputting the logits for the end of the range.

        :param questions: The questions and context to predict on.
        :type questions: list[str]
        :return: The logits for the end of the range.
        :rtype: list[list[float]]
        """
        return self.predict_qa(questions, False)

    def output_names(self, inputs):
        """Define the output names as tokens.

        :param inputs: The inputs to the model.
        :type inputs: list[str]
        :return: The output names as the decoded tokens.
        :rtype: list[str]
        """
        question, context = inputs.split(SEP)
        d = self._qa_model.tokenizer(question, context)
        return [self._qa_model.tokenizer.decode([id]) for id in d["input_ids"]]
