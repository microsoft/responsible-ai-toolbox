# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""BaseResult of ResponsibleAI tools."""

import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Generic, List, TypeVar, Union

import jsonschema

from raiutils.data_processing import serialize_json_safe
from responsibleai._internal.constants import SerializationAttributes
from responsibleai._tools.shared.attribute_serialization import (
    load_attributes, save_attributes)

TResult = TypeVar('TResult')  # Type for subclasses of BaseResult


class BaseResult(ABC, Generic[TResult]):
    def __init__(self, id: str, version: str) -> TResult:
        """Construct a BaseResult.

        :param id: ID of the result.
        :param version: Version of the result.
        :return: New BaseResult.
        """
        self.id = id
        self.version = version

        self._dashboard_data = None

    def save(self, path: Union[str, Path]) -> None:
        """Save the result to disk at the provided path.

        :param path: Path to result directory on disk.
        """
        # Save metadata like ID and and version to disk
        self._save_metadata(path)

        # Save all result attributes to disk
        save_attributes(self, self._get_attributes(), path)

        # Save dashboard data
        self._save_dashboard(path)

    def _save_metadata(self, result_dir: Path):
        """Save result metadata to disk.

        :param path: Path to result directory on disk.
        """
        id_path = result_dir / SerializationAttributes.ID_FILENAME
        with open(id_path, 'w') as f:
            json.dump({SerializationAttributes.ID_KEY: self.id}, f)

        version_path = result_dir / SerializationAttributes.VERSION_FILENAME
        with open(version_path, 'w') as f:
            json.dump({SerializationAttributes.VERSION_KEY: self.version}, f)

    def _save_dashboard(self, result_dir: Path):
        """Save result dashboard to disk.

        :param path: Path to result directory on disk.
        """
        dashboard = self._get_dashboard_data()
        dashboard_filename = SerializationAttributes.DASHBOARD_FILENAME
        with open(result_dir / dashboard_filename, 'w') as f:
            json.dump(dashboard, f)

    @classmethod
    def load(cls, path: Union[str, Path]) -> TResult:
        """Load a result from disk at the provided path.

        :param path: Path to result directory on disk.
        """
        result_dir = Path(path)
        loaded = cls()

        # Load metadata like ID and version
        loaded._load_metadata(result_dir)

        # Load all result attributes from disk
        load_attributes(loaded, loaded._get_attributes(), result_dir)

        # Load dashboard data
        loaded._load_dashboard(result_dir)

        loaded._validate_schema()
        return loaded

    def _load_metadata(self, result_dir: Path) -> str:
        """Load result metadata from disk.

        :param path: Path to result directory on disk.
        """
        id_path = result_dir / SerializationAttributes.ID_FILENAME
        with open(id_path, 'r') as f:
            self.id = json.load(f)[SerializationAttributes.ID_KEY]

        version_path = result_dir / SerializationAttributes.VERSION_FILENAME
        with open(version_path, 'r') as f:
            self.version = json.load(f)[SerializationAttributes.VERSION_KEY]

    def _load_dashboard(self, result_dir: Path) -> str:
        """Load result dashboard from disk.

        :param path: Path to result directory on disk.
        """
        dashboard_filename = SerializationAttributes.DASHBOARD_FILENAME
        with open(result_dir / dashboard_filename, 'r') as f:
            self._dashboard_data = json.load(f)

    def _validate_schema(self):
        schema = self._get_schema(self.version)
        jsonschema.validate(self._get_dashboard_data(), schema)

    @abstractmethod
    def _get_dashboard_object(self):
        """Get the dashboard object for the result.

        This object is created with the shared interfaces used by the
        ResponsibleAI widgets to ensure consistent contracts.

        See responsibleai/_interfaces.py for existing interfaces.
        """
        pass

    def _get_dashboard_data(self):
        """Get the Python dict representation of the dashboard object."""
        if self._dashboard_data is None:
            dashboard_object = self._get_dashboard_object()
            self._dashboard_data = serialize_json_safe(dashboard_object)

        return self._dashboard_data

    @classmethod
    @abstractmethod
    def _get_schema(cls, version: str) -> Any:
        pass

    @abstractmethod
    def _get_attributes(self) -> List[str]:
        pass
