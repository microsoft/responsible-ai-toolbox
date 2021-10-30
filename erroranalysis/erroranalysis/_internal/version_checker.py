# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from warnings import warn

import pandas as pd


def check_pandas_version(feature_names):
    """
    Checks if the current version of pandas is 0.X and raise appropriate
    warnings for the user.

    :param feature_names: The list of feature names.
    :type feature_names: list[str]
    """
    if pd.__version__[0] == '0':
        for feature_name in feature_names:
            if '-' in feature_name:
                message = 'The feature name ' + feature_name + \
                    ' contains `-` which has issues with pandas version ' + \
                    pd.__version__ + '. Please upgrade your pandas to 1.x'
                warn(message)
