# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import shutil
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

import numpy as np
import PIL
import pytest
from common_vision_utils import (DummyFlowersPipelineSerializer,
                                 ImageClassificationPipelineSerializer,
                                 ObjectDetectionPipelineSerializer,
                                 create_dummy_model,
                                 create_image_classification_pipeline,
                                 load_flowers_dataset,
                                 load_fridge_object_detection_dataset,
                                 load_imagenet_dataset, load_imagenet_labels,
                                 retrieve_fridge_object_detection_model)
from rai_vision_insights_validator import run_and_validate_serialization

from responsibleai_vision import ModelTask, RAIVisionInsights
from responsibleai_vision.common.constants import ImageColumns

FRIDGE_CLASS_NAMES = np.array(['can', 'carton',
                               'milk_bottle', 'water_bottle'])


class FakeImageDownloader:
    def __init__(self, test_mltable_path):
        self._images_df = self.get_data()

    def get_data(self):
        return None


class TestRAIVisionInsightsSaveAndLoadScenarios(object):

    def test_rai_insights_empty_save_load_save(self):
        data = load_imagenet_dataset()
        pred = create_image_classification_pipeline()
        task_type = ModelTask.IMAGE_CLASSIFICATION
        class_names = load_imagenet_labels()
        test = data[:3]
        label = ImageColumns.LABEL
        serializer = ImageClassificationPipelineSerializer()

        run_and_validate_serialization(
            pred, test, task_type, class_names, label, serializer)

    @pytest.mark.skip("Insufficient memory on test machines to load images")
    def test_rai_insights_large_images_save_load_save(self):
        PIL.Image.MAX_IMAGE_PIXELS = None
        data = load_flowers_dataset(upscale=True)
        model = create_dummy_model(data)
        test = data
        class_names = data[ImageColumns.LABEL.value].unique()
        task_type = ModelTask.IMAGE_CLASSIFICATION
        label = ImageColumns.LABEL
        serializer = DummyFlowersPipelineSerializer()

        image_width = 2
        run_and_validate_serialization(
            model, test, task_type, class_names, label, serializer,
            image_width)

    def test_loading_rai_insights_without_model_file(self):
        data = load_imagenet_dataset()
        pred = create_image_classification_pipeline()
        task_type = ModelTask.IMAGE_CLASSIFICATION
        class_names = load_imagenet_labels()
        test = data[:3]
        label = ImageColumns.LABEL
        serializer = ImageClassificationPipelineSerializer()

        rai_insights = RAIVisionInsights(
            pred, test, label,
            task_type=task_type,
            classes=class_names,
            serializer=serializer)

        with TemporaryDirectory() as tmpdir:
            assert rai_insights.model is not None
            save_path = Path(tmpdir) / "rai_insights"
            rai_insights.save(save_path)

            # Remove the model.pkl file to cause an exception to occur
            # while loading the model.
            model_name = 'image-classification-model'
            model_pkl_path = Path(tmpdir) / "rai_insights" / model_name
            shutil.rmtree(model_pkl_path)
            match_msg = 'No file or directory found'
            with pytest.raises(OSError, match=match_msg):
                without_model_rai_insights = RAIVisionInsights.load(save_path)
                assert without_model_rai_insights.model is None

    @pytest.mark.parametrize('automl_format', [True, False])
    def test_rai_insights_object_detection(self, automl_format):
        data = load_fridge_object_detection_dataset(automl_format)
        model = retrieve_fridge_object_detection_model(
            load_fridge_weights=True
        )
        task_type = ModelTask.OBJECT_DETECTION
        test = data[:3]
        label = ImageColumns.LABEL
        serializer = ObjectDetectionPipelineSerializer()

        run_and_validate_serialization(
            model, test, task_type, FRIDGE_CLASS_NAMES, label,
            serializer, ignore_test_data=True)

    def test_rai_insights_image_downloader_object_detection(self):
        data = load_fridge_object_detection_dataset(True)
        model = retrieve_fridge_object_detection_model(
            load_fridge_weights=True
        )
        task_type = ModelTask.OBJECT_DETECTION
        test = data[:3]
        label = ImageColumns.LABEL
        serializer = ObjectDetectionPipelineSerializer()

        get_data = ('test_rai_vision_insights_save_and_load_scenarios'
                    '.FakeImageDownloader.get_data')
        with patch(get_data) as mock_images_df:
            mock_images_df.return_value = test.copy()
            run_and_validate_serialization(
                model, test, task_type, FRIDGE_CLASS_NAMES, label,
                serializer, ignore_test_data=True,
                image_downloader=FakeImageDownloader)
