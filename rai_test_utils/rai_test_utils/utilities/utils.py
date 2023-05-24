# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import uuid


def is_valid_uuid(id: str):
    """Check if the given id is a valid uuid.

    :param id: The id to check.
    :type id: str
    :return: True if the id is a valid uuid, False otherwise.
    :rtype: bool
    """
    try:
        uuid.UUID(str(id))
        return True
    except ValueError:
        return False
