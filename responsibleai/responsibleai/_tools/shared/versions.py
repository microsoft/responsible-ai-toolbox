# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Versions for ResponsibleAI results."""


class BaseVersions:
    """Base class for result versions."""

    @classmethod
    def get_all(cls):
        constants = []
        for attribute in dir(cls):
            if attribute.startswith('V_'):
                constants.append(getattr(cls, attribute))
        return constants


class CausalVersions(BaseVersions):
    """Versions for CausalResults."""

    V_0_0_0 = '0.0.0'
    V_0_1_0 = '0.1.0'

    CURRENT = V_0_1_0
