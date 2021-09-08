# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import pytest

from responsibleai._tools.shared.attribute_serialization import (
    load_attributes, save_attributes,
    SerializationExtensions, SerializationFormat)


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
        attributes = {
            'a': SerializationFormat.PICKLE,
            'b': SerializationFormat.PICKLE,
        }
        save_dir = tmpdir.mkdir('save-dir')
        self._validate_roundtrip(example, attributes, save_dir)

    def test_json(self, tmpdir):
        example = Example(a={'a': 'A'}, b={'b': 'B'}, c={'c': 'C'})
        attributes = {
            'a': SerializationFormat.JSON,
            'b': SerializationFormat.JSON,
        }
        save_dir = tmpdir.mkdir('save-dir')
        self._validate_roundtrip(example, attributes, save_dir)

    def test_text(self, tmpdir):
        example = Example(a='A', b='B', c='C')
        save_dir = tmpdir.mkdir('save-dir')
        attributes = {
            'a': SerializationFormat.TEXT,
            'b': SerializationFormat.TEXT,
        }
        self._validate_roundtrip(example, attributes, save_dir)

    def test_missing_attribute_fail(self, tmpdir):
        save_dir = tmpdir.mkdir('save-dir')

        o_pre = Example(a='A', b='B', c='C')
        attributes = {
            'a': SerializationFormat.TEXT,
            'b': SerializationFormat.TEXT,
        }
        save_attributes(o_pre, attributes, save_dir)

        o_post = Example()
        attributes = {
            'a': SerializationFormat.TEXT,
            'b': SerializationFormat.TEXT,
            'c': SerializationFormat.TEXT,
        }
        message = ".*No such file or directory: .*save-dir[\\\\/]+c.txt"
        with pytest.raises(FileNotFoundError, match=message):
            load_attributes(o_post, attributes, save_dir)

    def test_missing_attribute_pass(self, tmpdir):
        save_dir = tmpdir.mkdir('save-dir')

        o_pre = Example(a='A', b='B', c='C')
        attributes = {
            'a': SerializationFormat.TEXT,
            'b': SerializationFormat.TEXT,
        }
        save_attributes(o_pre, attributes, save_dir)

        o_post = Example()
        attributes = {
            'a': SerializationFormat.TEXT,
            'b': SerializationFormat.TEXT,
            'c': SerializationFormat.TEXT,
        }
        load_attributes(o_post, attributes, save_dir,
                        fail_on_missing=False)

    def _validate_roundtrip(self, o, attributes, save_dir):
        save_attributes(o, attributes, save_dir)

        o_post = Example()
        load_attributes(o_post, attributes, save_dir)

        for attribute in attributes:
            assert getattr(o, attribute) == getattr(o_post, attribute)
