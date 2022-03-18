# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import requests

from raiutils.common.retries import retry_function


class Post(object):
    """A class for sending post requests to a webservice."""

    def __init__(self, uri, input_data, headers):
        """Initialize the Post object.

        :param uri: The URI to send the post request to.
        :type uri: str
        :param input_data: The data to send in the post request.
        :type input_data: dict
        :param headers: The optional headers to send with the post request.
        :type headers: dict
        """
        self._uri = uri
        self._input_data = input_data
        self._headers = headers

    def post(self):
        """Send the post request to the URI.

        :return: The response from the post request.
        :rtype: requests.Response
        """
        return requests.post(self._uri, self._input_data,
                             headers=self._headers)


def post_with_retries(uri, input_data, headers=None,
                      max_retries=4, retry_delay=60):
    """Send a post request to a webservice with exponential backoff.

    :param uri: The URI to send the post request to.
    :type uri: str
    :param input_data: The data to send in the post request.
    :type input_data: dict
    :param headers: The optional headers to send with the post request.
    :type headers: dict
    :param max_retries: The maximum number of retries.
    :type max_retries: int
    :param retry_delay: The delay between retries.
    :type retry_delay: int
    :return: The response from the post request.
    :rtype: requests.Response
    """
    post = Post(uri, input_data, headers)
    action_name = "Post"
    err_msg = "Unable to post to web service"
    return retry_function(post.post, action_name, err_msg,
                          max_retries=max_retries, retry_delay=retry_delay)
