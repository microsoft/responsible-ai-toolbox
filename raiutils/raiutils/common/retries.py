# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import time


def retry_function(function, action_name, err_msg,
                   max_retries=4, retry_delay=60):
    """Common utility to retry calling a function with exponential backoff.

    :param function: The function to call.
    :type function: function
    :param action_name: The name of the action being performed.
    :type action_name: str
    :param err_msg: The error message to display if the function fails.
    :type err_msg: str
    :param max_retries: The maximum number of retries.
    :type max_retries: int
    :param retry_delay: The delay between retries.
    :type retry_delay: int
    :return: The result of the function call. May be None if function
        does not return a result.
    :rtype: object
    """
    for i in range(max_retries):
        try:
            print("{0} attempt {1} of {2}".format(
                action_name, i + 1, max_retries))
            result = function()
            break
        except Exception as e:
            print("{0} attempt failed with exception:".format(action_name))
            print(e)
            if i + 1 != max_retries:
                print("Will retry after {0} seconds".format(retry_delay))
                time.sleep(retry_delay)
                retry_delay = retry_delay * 2
    else:
        raise RuntimeError(err_msg)

    return result
