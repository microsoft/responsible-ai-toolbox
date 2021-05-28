# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
import subprocess


REQUIRED_DEPENDENCIES = [
    'econml',
    'dice-ml',
    'interpret-community',
]

DISALLOWED_DEPENDENCIES = [
    'tensorflow',
    'keras',
    'pytorch',
    'matplotlib',
]


@pytest.fixture(scope='class')
def dep_trees():
    trees = {}
    for dep in REQUIRED_DEPENDENCIES:
        trees[dep] = str(subprocess.check_output(['deptree', dep]))
    return trees


class TestDependencies:

    @pytest.mark.parametrize('required', REQUIRED_DEPENDENCIES)
    @pytest.mark.parametrize('disallowed', DISALLOWED_DEPENDENCIES)
    def test_econml_dependencies(self, dep_trees, required, disallowed):
        tree = dep_trees[required]
        assert tree is not None
        assert disallowed not in tree
