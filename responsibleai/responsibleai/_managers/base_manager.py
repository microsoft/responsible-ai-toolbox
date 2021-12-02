# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the base class for managers."""

from abc import ABC, abstractmethod
import timeit


def measure_time(manager_compute_func):
    def compute_wrapper(*args, **kwargs):
        print(args)
        print(args[0])
        # import pdb
        # pdb.set_trace()
        separator(80)
        start_time = timeit.default_timer()
        manager_compute_func(*args, **kwargs)
        elapsed = timeit.default_timer() - start_time
        m, s = divmod(elapsed, 60)
        print('Time taken: {0} min {1} sec'.format(
              m, s))
        separator(80)
    return compute_wrapper


def separator(max_len):
    print('=' * max_len)


def log(log_str, print_to_console=False):
    if print_to_console:
        print(log_str)


class BaseManager(ABC):
    """The base class for managers."""

    def __init__(self, *args, **kwargs):
        """Initialize the BaseManager."""
        super(BaseManager, self).__init__(*args, **kwargs)

    @abstractmethod
    def add(self):
        """Abstract method to add a computation to the manager."""

    @abstractmethod
    def compute(self, show_progress):
        """Abstract method to compute the new work in the add method.

        :param show_progress: Boolean flag to give user feedback.
        :type show_progress: bool
        """

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
