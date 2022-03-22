# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from raiutils.common.retries import retry_function

try:
    from urllib import urlretrieve
except ImportError:
    from urllib.request import urlretrieve


class Retriever(object):
    """A class for retrieving files from a URL."""

    def __init__(self, url, filename):
        """Initialize the Retriever object.

        :param url: The URL to retrieve the file from.
        :type url: str
        :param filename: The filename to retrieve.
        :type filename: str
        """
        self._url = url
        self._filename = filename

    def retrieve(self):
        """Retrieve the file from the URL."""
        urlretrieve(self._url, self._filename)


def fetch_dataset(url, filename, max_retries=4, retry_delay=60):
    """Retrieve a dataset from a URL.

    :param url: The URL to retrieve the dataset from.
    :type url: str
    :param filename: The filename to retrieve.
    :type filename: str
    :param max_retries: The maximum number of retries.
    :type max_retries: int
    :param retry_delay: The delay between retries.
    :type retry_delay: int
    """
    retriever = Retriever(url, filename)
    action_name = "Download"
    err_msg = "Failed to download dataset"
    retry_function(retriever.retrieve, action_name, err_msg,
                   max_retries=max_retries, retry_delay=retry_delay)
