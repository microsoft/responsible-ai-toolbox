# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

# Defines common utilities for error analysis tests
import numpy as np
import pandas as pd


def replicate_dataset(X, y, replications=16):
    for _ in range(replications):
        X = pd.concat([X, X], ignore_index=True)
        y = np.concatenate([y, y])
    return X, y
