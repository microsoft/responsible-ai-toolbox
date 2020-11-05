# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines error handling utilities."""

import traceback


def _format_exception(ex):
    return ''.join(traceback.format_exception(type(ex), ex, ex.__traceback__))
