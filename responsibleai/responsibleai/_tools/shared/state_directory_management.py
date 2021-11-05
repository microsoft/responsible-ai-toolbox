# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Directory management of state of ResponsibleAI insights."""

import os
import uuid
from pathlib import Path


class DirectoryManager:

    CONFIGURATION = 'configuration'
    DATA = 'data'
    EXPLAINER = 'explainer'

    def __init__(self, parent_directory_path, sub_directory_name=None):
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
        config_directory = (Path(self.parent_directory_path) /
                            self.sub_directory_name /
                            DirectoryManager.CONFIGURATION)
        if not config_directory.exists():
            config_directory.mkdir(parents=True, exist_ok=True)

    def create_data_directory(self):
        data_directory = (Path(self.parent_directory_path) /
                          self.sub_directory_name /
                          DirectoryManager.DATA)
        if not data_directory.exists():
            data_directory.mkdir(parents=True, exist_ok=True)

    def create_explainer_directory(self):
        explainer_directory = (Path(self.parent_directory_path) /
                               self.sub_directory_name /
                               DirectoryManager.EXPLAINER)
        if not explainer_directory.exists():
            explainer_directory.mkdir(parents=True, exist_ok=True)

    def get_config_directory(self):
        return (Path(self.parent_directory_path) /
                self.sub_directory_name /
                DirectoryManager.CONFIGURATION)

    def get_data_directory(self):
        return (Path(self.parent_directory_path) /
                self.sub_directory_name /
                DirectoryManager.DATA)

    def get_explainer_directory(self):
        return (Path(self.parent_directory_path) /
                self.sub_directory_name /
                DirectoryManager.EXPLAINER)

    @staticmethod
    def list_sub_directories(path):
        return os.listdir(Path(path))
