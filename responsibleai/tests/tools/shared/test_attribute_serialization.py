# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import pytest

from responsibleai._tools.shared.attribute_serialization import (
    SerializationExtensions, SerializationFormats, load_attributes,
    save_attributes)


class Example:
    def __init__(self, a=None, b=None, c=None):
        self.a = a
        self.b = b
        self.c = c


class TestAttributeSerialization:
    def test_invalid_format(self):
        with pytest.raises(ValueError, match='Unknown format: invalid_format'):
            SerializationExtensions.from_format('invalid_format')

    def test_pickle(self, tmpdir):
        example = Example(a='A', b='B', c='C')
        attributes = ['a', 'b']
        save_dir = tmpdir.mkdir('save-dir')
        file_format = SerializationFormats.PICKLE
        self._validate_roundtrip(example, attributes, save_dir, file_format)

    def test_json(self, tmpdir):
        example = Example(a={'a': 'A'}, b={'b': 'B'}, c={'c': 'C'})
        attributes = ['a', 'b']
        save_dir = tmpdir.mkdir('save-dir')
        file_format = SerializationFormats.JSON
        self._validate_roundtrip(example, attributes, save_dir, file_format)

    def test_text(self, tmpdir):
        example = Example(a='A', b='B', c='C')
        save_dir = tmpdir.mkdir('save-dir')
        attributes = ['a', 'b']
        file_format = SerializationFormats.TEXT
        self._validate_roundtrip(example, attributes, save_dir, file_format)

    def test_list_formats(self, tmpdir):
        example = Example(a='A', b='B', c='C')
        save_dir = tmpdir.mkdir('save-dir')
        attributes = ['a', 'b']
        file_format = [
            SerializationFormats.TEXT,
            SerializationFormats.PICKLE,
        ]
        self._validate_roundtrip(example, attributes, save_dir, file_format)

    def test_missing_attribute_fail(self, tmpdir):
        save_dir = tmpdir.mkdir('save-dir')

        example = Example(a='A', b='B', c='C')

        save_attributes(example, ['a', 'b'], save_dir,
                        file_format=SerializationFormats.JSON)

        o_post = Example()
        message = ".*No such file or directory: .*save-dir[\\\\/]+c.json"
        with pytest.raises(FileNotFoundError, match=message):
            load_attributes(o_post, ['a', 'b', 'c'], save_dir,
                            file_format=SerializationFormats.JSON)

    def test_missing_attribute_pass(self, tmpdir):
        save_dir = tmpdir.mkdir('save-dir')

        example = Example(a='A', b='B', c='C')

        save_attributes(example, ['a', 'b'], save_dir)

        o_post = Example()
        load_attributes(o_post, ['a', 'b', 'c'], save_dir,
                        fail_on_missing=False)

    def _validate_roundtrip(self, o, attributes, save_dir, file_format):
        save_attributes(o, attributes, save_dir, file_format=file_format)

        o_post = Example()
        load_attributes(o_post, attributes, save_dir, file_format=file_format)

        for attribute in attributes:
            assert getattr(o, attribute) == getattr(o_post, attribute)
