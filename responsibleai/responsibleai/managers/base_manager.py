# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the base class for managers."""

from abc import ABC, abstractmethod


class BaseManager(ABC):
    """The base class for managers."""

    def __init__(self, *args, **kwargs):
        """Initialize the BaseManager."""
        super(BaseManager, self).__init__(*args, **kwargs)

    @abstractmethod
    def add(self):
        """Abstract method to add a computation to the manager."""

    @abstractmethod
    def compute(self):
        """Abstract method to compute the new work in the add method."""

    @abstractmethod
    def get(self):
        """Abstract method to get the computed results.

        :return: The computed results.
        :rtype: object
        """

    @abstractmethod
    def list(self):
        """Abstract method to list information about the manager.

        :return: A dictionary of properties.
        :rtype: dict
        """

    @property
    @abstractmethod
    def name(self):
        """Abstract property to get the name of the manager.

        :return: The name of the manager.
        :rtype: str
        """

    @abstractmethod
    def _save(self, path):
        """Abstract method to save the manager.

        :param path: The directory path to save the manager to.
        :type path: str
        """

    @staticmethod
    @abstractmethod
    def _load(path, rai_insights):
        """Static method to load the manager.

        :param path: The directory path to load the manager from.
        :type path: str
        :param rai_insights: The loaded parent RAIInsights.
        :type rai_insights: RAIInsights
        :return: The BaseManager after loading.
        :rtype: BaseManager
        """
