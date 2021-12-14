# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Directory management of state of ResponsibleAI insights."""

import os
import uuid
from pathlib import Path
from typing import List


class DirectoryManager:

    CONFIGURATION = 'configuration'
    DATA = 'data'
    GENERATORS = 'generators'

    def __init__(self, parent_directory_path, sub_directory_name=None):
        """Directory manager for managing the configuration,
           dashboard data and generators need to recompose the state
           in the various managers.

        :param parent_directory_path: Directory path of where the state data
                                      directory will be stored.
        :type parent_directory_path: Path
        :param sub_directory_name: The name where the state needs to be stored
                                   or the directory where the state can be
                                   found.
        :type sub_directory_name: str
        """
        self.parent_directory_path = parent_directory_path

        if sub_directory_name is None:
            self.sub_directory_name = str(uuid.uuid4())
        else:
            self.sub_directory_name = sub_directory_name

        parent_directory = Path(self.parent_directory_path)
        if not parent_directory.exists():
            parent_directory.mkdir(parents=True, exist_ok=True)

        sub_directory = (Path(self.parent_directory_path) /
                         self.sub_directory_name)
        if not sub_directory.exists():
            sub_directory.mkdir(parents=True, exist_ok=True)

    def create_config_directory(self):
        """Create the configuration directory and return its path.

        :returns: Path to the configuration directory.
        """
        config_directory = (Path(self.parent_directory_path) /
                            self.sub_directory_name /
                            DirectoryManager.CONFIGURATION)
        if not config_directory.exists():
            config_directory.mkdir(parents=True, exist_ok=True)

        return config_directory

    def create_data_directory(self):
        """Create the dashboard data directory and return its path.

        :returns: Path to the dashboard data directory.
        """
        data_directory = (Path(self.parent_directory_path) /
                          self.sub_directory_name /
                          DirectoryManager.DATA)
        if not data_directory.exists():
            data_directory.mkdir(parents=True, exist_ok=True)

        return data_directory

    def create_generators_directory(self):
        """Create the generators directory and return its path.

        :returns: Path to the generators directory.
        """
        generators_directory = (Path(self.parent_directory_path) /
                                self.sub_directory_name /
                                DirectoryManager.GENERATORS)
        if not generators_directory.exists():
            generators_directory.mkdir(parents=True, exist_ok=True)

        return generators_directory

    def get_config_directory(self):
        """Return the path of the configuration directory.

        :returns: Path to the configuration directory.
        :rtype: Path
        """
        return (Path(self.parent_directory_path) /
                self.sub_directory_name /
                DirectoryManager.CONFIGURATION)

    def get_data_directory(self):
        """Return the path of the dashboard data directory.

        :returns: Path to the dashboard data directory.
        :rtype: Path
        """
        return (Path(self.parent_directory_path) /
                self.sub_directory_name /
                DirectoryManager.DATA)

    def get_generators_directory(self):
        """Return the path of the generators directory.

        :returns: Path to the generators directory.
        :rtype: Path
        """
        return (Path(self.parent_directory_path) /
                self.sub_directory_name /
                DirectoryManager.GENERATORS)

    @staticmethod
    def list_sub_directories(path) -> List[str]:
        """List all the directories give a path and return.

        Will return an empty list if the path does not exist.

        :param path: Path to look into to list all directories.
        :type path: Path

        :returns: List of all directories found in this path.
        :rtype: List[str]
        """
        target_dir = Path(path)
        if target_dir.exists():
            return os.listdir(target_dir)
        else:
            return []
