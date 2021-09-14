# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
import re
import semver

from responsibleai._tools.shared.versions import CausalVersions


class TestVersions:

    @pytest.mark.parametrize(
        'versions_class',
        [
            CausalVersions,
        ]
    )
    def test_all_versions(self, versions_class):
        versions = versions_class.get_all()
        assert len(versions) > 0
        for version in versions:
            # Check valid semantic version
            semver.VersionInfo.parse(version)

    @pytest.mark.parametrize(
        'versions_class',
        [
            CausalVersions,
        ]
    )
    def test_version_constant_names(self, versions_class):
        exceptions = ['CURRENT']
        for name, _ in vars(versions_class).items():
            if name.startswith('__'):
                continue
            if name != name.upper():
                continue
            if name in exceptions:
                continue
            pattern = r'^V_\d+_\d+_\d+$'
            match = re.match(pattern, name)
            assert match is not None, name
