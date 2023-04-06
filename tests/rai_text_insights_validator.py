# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd

from responsibleai_text import ModelTask


def validate_rai_text_insights(
    rai_text_insights,
    train_data,
    test_data,
    target_column,
    task_type
):
    pd.testing.assert_frame_equal(rai_text_insights.train, train_data)
    pd.testing.assert_frame_equal(rai_text_insights.test, test_data)
    assert rai_text_insights.target_column == target_column
    assert rai_text_insights.task_type == task_type
    if task_type == ModelTask.TEXT_CLASSIFICATION:
        classes = train_data[target_column].unique()
        classes.sort()
        np.testing.assert_array_equal(rai_text_insights._classes,
                                      classes)
