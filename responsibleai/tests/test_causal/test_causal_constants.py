# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import re
import semver

from responsibleai._tools.causal.causal_constants import (
    DefaultParams, Versions)


class TestCausalConstants:
    def test_tree_depth_limit(self):
        # The causal dashboard requires that this constant be no
        # greater than 2 in order to correctly display the
        # policy tree chart
        assert DefaultParams.DEFAULT_MAX_TREE_DEPTH == 2

    def test_all_versions(self):
        versions = Versions.get_all()
        assert len(versions) > 0
        for version in versions:
            # Check valid semantic version
            semver.VersionInfo.parse(version)

    def test_version_constant_names(self):
        exceptions = ['CURRENT']
        for name, _ in vars(Versions).items():
            if name.startswith('__'):
                continue
            if name != name.upper():
                continue
            if name in exceptions:
                continue
            pattern = r'^V_\d+_\d+_\d+$'
            match = re.match(pattern, name)
            assert match is not None, name
