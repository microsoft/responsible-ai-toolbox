# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for debugging machine learning models.

You can use error analysis tool to dive deeper into why your ML model
is predicting incorrectly.
"""

# Setup logging infrustructure
import logging
import os
import atexit
# Only log to disk if environment variable specified
error_analysis_logs = os.environ.get('ERROR_ANALYSIS_LOGS')
if error_analysis_logs is not None:
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)
    os.makedirs(os.path.dirname(error_analysis_logs), exist_ok=True)
    handler = logging.FileHandler(error_analysis_logs, mode='w')
    handler.setLevel(logging.INFO)
    logger.addHandler(handler)
    logger.info('Initializing logging file for error-analysis')

    def close_handler():
        handler.close()
        logger.removeHandler(handler)
    atexit.register(close_handler)
