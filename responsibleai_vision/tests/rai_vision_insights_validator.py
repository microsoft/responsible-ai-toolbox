# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os
from pathlib import Path
from tempfile import TemporaryDirectory

import pandas as pd

from responsibleai._internal.constants import ManagerNames
from responsibleai_vision import RAIVisionInsights

TRAIN_JSON = 'train.json'
TEST_JSON = 'test.json'
DATA = 'data'


def validate_rai_vision_insights(
    rai_vision_insights,
    test_data,
    target_column,
    task_type,
    ignore_index=False
):
    rai_vision_test = rai_vision_insights.test
    if ignore_index:
        rai_vision_test = rai_vision_test.reset_index(drop=True)
        test_data = test_data.reset_index(drop=True)
    pd.testing.assert_frame_equal(rai_vision_test, test_data)
    assert rai_vision_insights.target_column == target_column
    assert rai_vision_insights.task_type == task_type


def run_and_validate_serialization(
    pred,
    test,
    task_type,
    class_names,
    label,
    serializer,
    image_width=None
):
    """Run and validate serialization.

    :param pred: Model to use for insights
    :type pred: object
    :param test: Test data to use for insights
    :type test: pandas.DataFrame
    :param task_type: Task type of model
    :type task_type: ModelTask
    :param class_names: Class names for model
    :type class_names: list[str]
    :param label: Label column name
    :type label: str
    :param serializer: Serializer to use
    :type serializer: object
    :param image_width: Image width in inches
    :type image_width: int
    """
    rai_insights = RAIVisionInsights(
        pred, test, label,
        task_type=task_type,
        classes=class_names,
        serializer=serializer,
        image_width=image_width)

    with TemporaryDirectory() as tmpdir:
        save_1 = Path(tmpdir) / "first_save"
        save_2 = Path(tmpdir) / "second_save"

        # Save it
        rai_insights.save(save_1)
        assert len(os.listdir(save_1 / ManagerNames.EXPLAINER)) == 0
        assert not os.path.exists(save_1 / DATA / TRAIN_JSON)
        assert os.path.exists(save_1 / DATA / TEST_JSON)

        # Load
        rai_2 = RAIVisionInsights.load(save_1)

        # Validate
        validate_rai_vision_insights(
            rai_2, test,
            label, task_type)

        # Save again
        rai_2.save(save_2)
        assert len(os.listdir(save_2 / ManagerNames.EXPLAINER)) == 0
        assert not os.path.exists(save_2 / DATA / TRAIN_JSON)
        assert os.path.exists(save_2 / DATA / TEST_JSON)
