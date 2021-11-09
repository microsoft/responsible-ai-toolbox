# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import re

import pytest
import semver

from responsibleai._tools.shared.versions import CausalVersions


class TestVersions:

    @pytest.mark.parametrize(
        'versions_class',
        [
            CausalVersions,
        ]
    )
    def test_all_versions_valid(self, versions_class):
        version_strings = versions_class.get_all()
        assert len(version_strings) > 0

        current = semver.VersionInfo.parse(versions_class.get_current())
        for version_string in version_strings:
            # Check valid semantic version
            version = semver.VersionInfo.parse(version_string)

            # Check current version is the latest version
            assert version.compare(current) <= 0

    @pytest.mark.parametrize(
        'versions_class',
        [
            CausalVersions,
        ]
    )
    def test_all_versions_unique(self, versions_class):
        versions = versions_class.get_all()
        assert len(versions) > 0
        s = set()
        for version in versions:
            print(version, s)
            assert version not in s, f"Version {version} is duplicated"
            s.add(version)

    @pytest.mark.parametrize(
        'versions_class',
        [
            CausalVersions,
        ]
    )
    def test_version_name_formats(self, versions_class):
        for name, _ in vars(versions_class).items():
            if name.startswith('__'):
                continue
            if name != name.upper():
                continue
            pattern = r'^V_\d+_\d+_\d+$'
            match = re.match(pattern, name)
            assert match is not None, name
