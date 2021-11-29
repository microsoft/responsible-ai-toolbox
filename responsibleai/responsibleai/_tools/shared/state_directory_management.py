# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Directory management of state of ResponsibleAI insights."""

import os
import uuid
from pathlib import Path


class DirectoryManager:

    CONFIGURATION = 'configuration'
    DATA = 'data'
    MODELS = 'models'

    def __init__(self, parent_directory_path, sub_directory_name=None):
        """Directory manager for managing the configuration,
           dashboard data and models need to recompose the state
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

    def create_models_directory(self):
        """Create the models directory and return its path.

        :returns: Path to the models directory.
        """
        models_directory = (Path(self.parent_directory_path) /
                            self.sub_directory_name /
                            DirectoryManager.MODELS)
        if not models_directory.exists():
            models_directory.mkdir(parents=True, exist_ok=True)

        return models_directory

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

    def get_models_directory(self):
        """Return the path of the models directory.

        :returns: Path to the models directory.
        :rtype: Path
        """
        return (Path(self.parent_directory_path) /
                self.sub_directory_name /
                DirectoryManager.MODELS)

    @staticmethod
    def list_sub_directories(path):
        """List all the directories give a path and return.

        :param path: Path to look into to list all directories.
        :type path: Path

        :returns: List of all directories found in this path.
        :rtype: List[str]
        """
        return os.listdir(Path(path))
