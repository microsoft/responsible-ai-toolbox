# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Versions for ResponsibleAI results."""

import semver


class BaseVersions:
    """Base class for result versions."""

    @classmethod
    def get_all(cls):
        constants = []
        for attribute in dir(cls):
            if attribute.startswith('V_'):
                constants.append(getattr(cls, attribute))
        return constants

    @classmethod
    def get_current(cls):
        current = None
        current_string = None
        for version_string in cls.get_all():
            version = semver.VersionInfo.parse(version_string)
            if current is None or version.compare(current) > 0:
                current = version
                current_string = version_string
        return current_string


class CausalVersions(BaseVersions):
    """Versions for CausalResults."""

    V_0_0_0 = '0.0.0'
    V_0_1_0 = '0.1.0'
