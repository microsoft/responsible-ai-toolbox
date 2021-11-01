# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import subprocess

import pytest

REQUIRED_DEPENDENCIES = [
    'econml',
    'dice-ml',
    'interpret-community',
    'erroranalysis',
]

DISALLOWED_DEPENDENCIES = [
    'tensorflow',
    'keras',
    'pytorch',
    'matplotlib',
    'graphviz',
    'jupyter'
]

EXCEPTIONS = {}


@pytest.fixture(scope='class')
def dep_trees():
    trees = {}
    for dep in REQUIRED_DEPENDENCIES:
        trees[dep] = str(subprocess.check_output(['deptree', dep]))
    return trees


class TestDependencies:

    @pytest.mark.parametrize('required', REQUIRED_DEPENDENCIES)
    @pytest.mark.parametrize('disallowed', DISALLOWED_DEPENDENCIES)
    def test_dependencies(self, dep_trees, required, disallowed):
        if required in EXCEPTIONS and disallowed in EXCEPTIONS[required]:
            pytest.skip("Validation skipped for {} dependency of {}".format(
                disallowed, required))

        tree = dep_trees[required]
        assert tree is not None
        assert disallowed not in tree
