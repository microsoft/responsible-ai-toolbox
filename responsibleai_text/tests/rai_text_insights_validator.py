# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd

from responsibleai_text import ModelTask


def validate_global_importances(exp_data):
    global_importances = exp_data.globalFeatureImportance
    scores = global_importances.scores
    features = global_importances.featureNames
    assert len(scores) == len(features)


def validate_rai_text_insights(
    rai_text_insights,
    classes,
    test_data,
    target_column,
    task_type
):
    pd.testing.assert_frame_equal(rai_text_insights.test, test_data)
    assert rai_text_insights.target_column == target_column
    assert rai_text_insights.task_type == task_type
    explanation = rai_text_insights.explainer.get()
    assert explanation is None or isinstance(explanation, list)
    explanation_data = rai_text_insights.explainer.get_data()
    assert explanation_data is None or isinstance(explanation_data, list)
    if task_type == ModelTask.TEXT_CLASSIFICATION:
        np.testing.assert_array_equal(rai_text_insights._classes,
                                      classes)
        if explanation_data:
            exp_data = explanation_data[0].precomputedExplanations
            validate_global_importances(exp_data)
            local_data = exp_data.textFeatureImportance
            num_rows = len(test_data)
            assert len(local_data) == num_rows
            local_importances = local_data[0].localExplanations
            text = local_data[0].text
            assert len(local_importances) == len(text)
    if task_type == ModelTask.QUESTION_ANSWERING:
        if explanation_data:
            exp_data = explanation_data[0].precomputedExplanations
            validate_global_importances(exp_data)
            local_data = exp_data.textFeatureImportance
            num_rows = len(test_data)
            assert len(local_data) == num_rows
            local_importances = local_data[0].localExplanations
            text = local_data[0].text
            base_values = local_data[0].baseValues
            assert len(local_importances) == 2
            assert len(local_importances[0]) == len(text)
            assert len(base_values) == 2
            assert len(base_values[0]) == len(text)
