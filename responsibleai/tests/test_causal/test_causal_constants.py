# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from responsibleai._tools.causal.causal_constants import DefaultParams


class TestCausalConstants:
    def test_tree_depth_limit(self):
        # The causal dashboard requires that this constant be no
        # greater than 2 in order to correctly display the
        # policy tree chart
        assert DefaultParams.DEFAULT_MAX_TREE_DEPTH == 2
