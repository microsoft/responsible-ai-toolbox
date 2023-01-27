# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Utilities for attribute serialization."""

import json
import pickle
import warnings
from pathlib import Path
from typing import Any, List, Union

from responsibleai._internal.constants import FileFormats


class SerializationFormats:
    PICKLE = 'pickle'
    JSON = 'json'
    TEXT = 'text'


class SerializationExtensions:
    @classmethod
    def from_format(cls, file_format: str) -> str:
        if file_format == SerializationFormats.PICKLE:
            return FileFormats.PKL
        elif file_format == SerializationFormats.JSON:
            return FileFormats.JSON
        elif file_format == SerializationFormats.TEXT:
            return FileFormats.TXT
        else:
            raise ValueError(f"Unknown format: {file_format}")


def save_attributes(
    o: Any,
    attributes: List[str],
    path: Union[str, Path],
    file_format: Union[str, List[str]] = SerializationFormats.PICKLE,
) -> List[Path]:
    """Save attributes from an object to disk.

    :param o: Object from which to pull attributes.
    :param attributes: List of attributes on the object to save.
    :param path: Path to directory on disk in which to write the attributes.
    :param file_format: File format to use when writing to disk. A list of
        file formats can be passed to assign each attribute a different
        format.
    :returns: List of paths to the saved attributes.
    """
    paths = []
    dir_path = Path(path)
    is_format_list = isinstance(file_format, list)
    for i, attribute in enumerate(attributes):
        attribute_format = file_format[i] if is_format_list else file_format
        value = getattr(o, attribute)
        extension = SerializationExtensions.from_format(attribute_format)
        path = dir_path / f'{attribute}{extension}'
        _save_attribute(value, path, attribute_format)
        paths.append(path)
    return paths


def _save_attribute(
    value: Any,
    path: Union[str, Path],
    file_format: str,
) -> None:
    if file_format == SerializationFormats.PICKLE:
        with open(path, 'wb') as f:
            pickle.dump(value, f)
    elif file_format == SerializationFormats.JSON:
        with open(path, 'w') as f:
            json.dump(value, f)
    elif file_format == SerializationFormats.TEXT:
        with open(path, 'w') as f:
            f.write(value)
    else:
        raise ValueError(f"Invalid format {file_format}")


def load_attributes(
    o: Any,
    attributes: List[str],
    path: Union[str, Path],
    file_format: Union[str, List[str]] = SerializationFormats.PICKLE,
    fail_on_missing: bool = True,
) -> None:
    """Load attributes from disk and save to an existing object.

    :param o: Object on which to save the loaded attributes.
    :param attributes: List of attributes to load to the object.
    :param path: Path to directory on disk where attributes are saved.
    :param file_format: File format to use when loading attributes from
        disk. A list of file formats can be passed to assign each
        attribute a different format.
    :param fail_on_missing: Whether to raise an exception if an attribute
        was not found.
    """
    dir_path = Path(path)
    is_format_list = isinstance(file_format, list)
    for i, attribute in enumerate(attributes):
        attribute_format = file_format[i] if is_format_list else file_format
        extension = SerializationExtensions.from_format(attribute_format)
        path = dir_path / f'{attribute}{extension}'
        if not fail_on_missing and (not path.exists() or not path.is_file()):
            continue
        value = _load_attribute(path, attribute_format)
        setattr(o, attribute, value)


def _load_attribute(
    path: Union[str, Path],
    file_format: str,
) -> Any:
    if file_format == SerializationFormats.PICKLE:
        val = None
        try:
            with open(path, 'rb') as f:
                val = pickle.load(f)
        except Exception:
            model_load_err = ('ERROR-LOADING-EXPLAINER: '
                              'There was an error loading the explainer. '
                              'Some of RAI dashboard features may not work.')
            warnings.warn(model_load_err, UserWarning)
        return val
    elif file_format == SerializationFormats.JSON:
        with open(path, 'r') as f:
            return json.load(f)
    elif file_format == SerializationFormats.TEXT:
        with open(path, 'r') as f:
            return f.read()
    else:
        raise ValueError(f"Invalid format {file_format}")
