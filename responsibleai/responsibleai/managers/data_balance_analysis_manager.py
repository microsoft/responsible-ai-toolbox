# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Data Balance Manager class."""

from responsibleai.managers.base_manager import BaseManager


class DataBalanceManager(BaseManager):
    def __init__(self):
        ...

    def add(self):
        ...

    def compute(self):
        ...

    def get(self):
        ...

    def list(self):
        ...

    def get_data(self):
        ...

    @property
    def name(self):
        ...
