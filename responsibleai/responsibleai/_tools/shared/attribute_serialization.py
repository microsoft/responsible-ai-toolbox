# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Utilities for attribute serialization."""

import json
import pickle

from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Union


class SerializationFormat(Enum):
    PICKLE = 'pickle'
    JSON = 'json'
    TEXT = 'text'


class SerializationExtensions:
    PKL = 'pkl'
    JSON = 'json'
    TXT = 'txt'

    @classmethod
    def from_format(cls, file_format: SerializationFormat) -> str:
        if file_format == SerializationFormat.PICKLE:
            return cls.PKL
        elif file_format == SerializationFormat.JSON:
            return cls.JSON
        elif file_format == SerializationFormat.TEXT:
            return cls.TXT
        else:
            raise ValueError(f"Unknown format: {file_format}")


def save_attributes(
    o: Any,
    attributes: Dict[str, SerializationFormat],
    path: Union[str, Path],
) -> List[Path]:
    """Save attributes from an object to disk.

    :param o: Object from which to pull attributes.
    :param attributes: Dictionary mapping attribute names to
        serialization formats to use when saving each attribute.
    :param path: Path to directory on disk in which to write the attributes.
    :param file_format: File format to use when writing to disk. A list of
        file formats can be passed to assign each attribute a different
        format.
    :returns: List of paths to the saved attributes.
    """
    paths = []
    dir_path = Path(path)
    for attribute, file_format in attributes.items():
        value = getattr(o, attribute)
        extension = SerializationExtensions.from_format(file_format)
        path = dir_path / f'{attribute}.{extension}'
        _save_attribute(value, path, file_format)
        paths.append(path)
    return paths


def _save_attribute(
    value: Any,
    path: Union[str, Path],
    file_format: str,
) -> None:
    if file_format == SerializationFormat.PICKLE:
        with open(path, 'wb') as f:
            pickle.dump(value, f)
    elif file_format == SerializationFormat.JSON:
        with open(path, 'w') as f:
            json.dump(value, f)
    elif file_format == SerializationFormat.TEXT:
        with open(path, 'w') as f:
            f.write(value)
    else:
        raise ValueError(f"Invalid format {file_format}")


def load_attributes(
    o: Any,
    attributes: Dict[str, SerializationFormat],
    path: Union[str, Path],
    fail_on_missing: bool = True,
) -> None:
    """Load attributes from disk and save to an existing object.

    :param o: Object on which to save the loaded attributes.
    :param attributes: Dictionary mapping attribute names to
        serialization formats to use when saving each attribute.
    :param path: Path to directory on disk where attributes are saved.
    :param fail_on_missing: Whether to raise an exception if an attribute
        was not found.
    """
    dir_path = Path(path)
    for attribute, file_format in attributes.items():
        extension = SerializationExtensions.from_format(file_format)
        path = dir_path / f'{attribute}.{extension}'
        if not fail_on_missing and (not path.exists() or not path.is_file()):
            continue
        value = _load_attribute(path, file_format)
        setattr(o, attribute, value)


def _load_attribute(
    path: Union[str, Path],
    file_format: SerializationFormat,
) -> Any:
    if file_format == SerializationFormat.PICKLE:
        with open(path, 'rb') as f:
            return pickle.load(f)
    elif file_format == SerializationFormat.JSON:
        with open(path, 'r') as f:
            return json.load(f)
    elif file_format == SerializationFormat.TEXT:
        with open(path, 'r') as f:
            return f.read()
    else:
        raise ValueError(f"Invalid format {file_format}")
