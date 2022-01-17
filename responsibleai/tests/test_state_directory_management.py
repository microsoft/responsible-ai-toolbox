# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from pathlib import Path

import pytest

from responsibleai._tools.shared.state_directory_management import \
    DirectoryManager


class TestStateDirectoryManagement:

    def _verify_directory_manager_operations(self, directory_manager):

        # Test the create APIs
        config_directory_path = directory_manager.create_config_directory()
        assert isinstance(config_directory_path, Path)
        assert config_directory_path.exists()
        assert DirectoryManager.CONFIGURATION in str(config_directory_path)

        data_directory_path = directory_manager.create_data_directory()
        assert isinstance(data_directory_path, Path)
        assert data_directory_path.exists()
        assert DirectoryManager.DATA in str(data_directory_path)

        generators_directory_path = \
            directory_manager.create_generators_directory()
        assert isinstance(generators_directory_path, Path)
        assert generators_directory_path.exists()
        assert DirectoryManager.GENERATORS in str(generators_directory_path)

        # Test the get APIs
        config_directory_path = directory_manager.get_config_directory()
        assert isinstance(config_directory_path, Path)
        assert config_directory_path.exists()
        assert DirectoryManager.CONFIGURATION in str(config_directory_path)

        data_directory_path = directory_manager.get_data_directory()
        assert isinstance(data_directory_path, Path)
        assert data_directory_path.exists()
        assert DirectoryManager.DATA in str(data_directory_path)

        generators_directory_path = \
            directory_manager.create_generators_directory()
        assert isinstance(generators_directory_path, Path)
        assert generators_directory_path.exists()
        assert DirectoryManager.GENERATORS in str(generators_directory_path)

    @pytest.mark.parametrize('create_parent_directory', [True, False])
    def test_directory_manager(self, tmpdir, create_parent_directory):
        if create_parent_directory:
            parent_directory = tmpdir.mkdir('parent_directory')
        else:
            parent_directory = tmpdir / 'parent_directory'
        dm_one = DirectoryManager(
            parent_directory_path=parent_directory,
            sub_directory_name='known')

        assert dm_one.parent_directory_path.exists()
        assert dm_one.sub_directory_name == 'known'
        assert (dm_one.parent_directory_path /
                dm_one.sub_directory_name).exists()

        self._verify_directory_manager_operations(dm_one)

        assert isinstance(
            DirectoryManager.list_sub_directories(parent_directory),
            list)
        assert len(
            DirectoryManager.list_sub_directories(parent_directory)) == 1
        assert 'known' in\
            DirectoryManager.list_sub_directories(parent_directory)

        dm_two = DirectoryManager(
            parent_directory_path=parent_directory)

        assert dm_two.parent_directory_path.exists()
        assert dm_two.sub_directory_name is not None
        assert (dm_two.parent_directory_path /
                dm_two.sub_directory_name).exists()

        self._verify_directory_manager_operations(dm_two)

        assert isinstance(
            DirectoryManager.list_sub_directories(parent_directory),
            list)
        assert len(
            DirectoryManager.list_sub_directories(parent_directory)) == 2
        assert dm_two.sub_directory_name in\
            DirectoryManager.list_sub_directories(parent_directory)
