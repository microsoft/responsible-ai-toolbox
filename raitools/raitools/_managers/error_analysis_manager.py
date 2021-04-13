# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Error Analysis Manager class."""

from raitools._managers.base_manager import BaseManager


class ErrorAnalysisManager(BaseManager):
    def __init__(self):
        pass

    def add(self):
        raise NotImplementedError(
            "Add not implemented for ErrorAnalysisManager")

    def compute(self):
        pass

    def get(self):
        raise NotImplementedError(
            "Get not implemented for ErrorAnalysisManager")

    def list(self):
        pass

    @property
    def name(self):
        """Get the name of the error analysis manager.

        :return: The name of the error analysis manager.
        :rtype: str
        """
        return "error analysis"

    def save(self, path):
        raise NotImplementedError(
            "Save not implemented for ErrorAnalysisManager")

    @staticmethod
    def load(path):
        raise NotImplementedError(
            "Load not implemented for ErrorAnalysisManager")
