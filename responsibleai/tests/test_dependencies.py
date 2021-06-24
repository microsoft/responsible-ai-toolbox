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
    'graphviz'
]


@pytest.fixture(scope='class')
def dep_trees():
    trees = {}
    for dep in REQUIRED_DEPENDENCIES:
        trees[dep] = str(subprocess.check_output(['deptree', dep]))
    return trees


class TestDependencies:

    @pytest.mark.parametrize('required', REQUIRED_DEPENDENCIES)
    @pytest.mark.parametrize('disallowed_dependency', DISALLOWED_DEPENDENCIES)
    def test_econml_dependencies(self, dep_trees, required,
                                 disallowed_dependency):
        tree = dep_trees[required]
        assert tree is not None
        if required == 'econml' and disallowed_dependency == 'graphviz':
            pytest.skip('econml carries graphviz as required dependency')
        assert disallowed_dependency not in tree
