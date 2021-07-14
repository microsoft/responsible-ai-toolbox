# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
from warnings import warn


def check_pandas_version(feature_names):
    if pd.__version__[0] == '0':
        for feature_name in feature_names:
            if '-' in feature_name:
                message = 'The feature name ' + feature_name + \
                    ' contains `-` which has issues with pandas version ' + \
                    pd.__version__ + '. Please upgrade your pandas to 1.x'
                warn(message)
