# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import sys

import numpy as np
import PIL
import pytest
from common_vision_utils import (FRIDGE_MULTILABEL_TARGETS, ImageTransformEnum,
                                 ImageTransforms, create_dummy_model,
                                 create_image_classification_pipeline,
                                 create_pytorch_vision_model,
                                 gridify_fridge_multilabel_labels,
                                 load_flowers_dataset, load_fridge_dataset,
                                 load_fridge_object_detection_dataset,
                                 load_imagenet_dataset, load_imagenet_labels,
                                 load_mnist_dataset,
                                 load_multilabel_fridge_dataset,
                                 retrieve_fridge_object_detection_model,
                                 retrieve_or_train_fridge_model)
from ml_wrappers.common.constants import Device
from rai_vision_insights_validator import validate_rai_vision_insights

from responsibleai.feature_metadata import FeatureMetadata
from responsibleai_vision import ModelTask, RAIVisionInsights
from responsibleai_vision.common.constants import (ExplainabilityDefaults,
                                                   ImageColumns)

DEFAULT_MAX_EVALS = ExplainabilityDefaults.DEFAULT_MAX_EVALS
DEFAULT_NUM_MASKS = ExplainabilityDefaults.DEFAULT_NUM_MASKS
DEFAULT_MASK_RES = ExplainabilityDefaults.DEFAULT_MASK_RES


class TestRAIVisionInsights(object):

    def test_rai_insights_image_classification_imagenet(self):
        data = load_imagenet_dataset()
        pred = create_image_classification_pipeline()
        task_type = ModelTask.IMAGE_CLASSIFICATION
        class_names = load_imagenet_labels()
        run_rai_insights(pred, data[:3], ImageColumns.LABEL,
                         task_type, class_names, image_mode='RGB')

    @pytest.mark.parametrize('max_evals', [None, 10, 200])
    def test_rai_insights_image_classification_max_evals(self, max_evals):
        data = load_imagenet_dataset()
        pred = create_image_classification_pipeline()
        task_type = ModelTask.IMAGE_CLASSIFICATION
        class_names = load_imagenet_labels()
        # run on a single image to avoid running out of memory on
        # test machines
        run_rai_insights(pred, data[:1], ImageColumns.LABEL,
                         task_type, class_names, image_mode='RGB',
                         test_explainer=True, max_evals=max_evals)

    @pytest.mark.parametrize('max_evals', [-100, -1, 0])
    def test_rai_insights_invalid_max_evals(self, max_evals):
        data = load_imagenet_dataset()
        pred = create_image_classification_pipeline()
        task_type = ModelTask.IMAGE_CLASSIFICATION
        class_names = load_imagenet_labels()
        with pytest.raises(ValueError,
                           match="max_evals must be greater than 0"):
            run_rai_insights(pred, data[:1], ImageColumns.LABEL,
                             task_type, class_names, image_mode='RGB',
                             test_explainer=True, max_evals=max_evals)

    def test_rai_insights_image_classification_fridge(self):
        data = load_fridge_dataset()
        try:
            model = retrieve_or_train_fridge_model(data)
        except Exception as e:
            print("Failed to retrieve or load Fastai model, force training")
            print("Inner exception message on retrieving model: {}".format(e))
            model = retrieve_or_train_fridge_model(data, force_train=True)
        task_type = ModelTask.IMAGE_CLASSIFICATION
        class_names = data[ImageColumns.LABEL.value].unique()
        run_rai_insights(model, data[:3], ImageColumns.LABEL,
                         task_type, class_names, test_error_analysis=True)

    def test_rai_insights_image_classification_mnist(self):
        train_data, test_data = load_mnist_dataset()
        model = create_pytorch_vision_model(train_data, test_data)
        task_type = ModelTask.IMAGE_CLASSIFICATION
        class_names = train_data[ImageColumns.LABEL.value].unique()
        run_rai_insights(
            model, test_data[:3], ImageColumns.LABEL,
            task_type, class_names)

    def test_rai_insights_multilabel_image_classification_fridge(self):
        data = load_multilabel_fridge_dataset()
        try:
            model = retrieve_or_train_fridge_model(data, multilabel=True)
        except Exception as e:
            print("Failed to retrieve or load Fastai model, force training")
            print("Inner exception message on retrieving model: {}".format(e))
            model = retrieve_or_train_fridge_model(
                data, force_train=True, multilabel=True)
        data = gridify_fridge_multilabel_labels(data)
        task_type = ModelTask.MULTILABEL_IMAGE_CLASSIFICATION
        run_rai_insights(model, data[:3], FRIDGE_MULTILABEL_TARGETS,
                         task_type, test_error_analysis=True)

    @pytest.mark.skip("This test seems to fail due to issues in the \
                      MacOS/Linux versions of the build/PR gate.")
    @pytest.mark.parametrize('num_masks', [None, 25, DEFAULT_NUM_MASKS])
    @pytest.mark.parametrize('mask_res', [None, DEFAULT_MASK_RES, 8])
    def test_rai_insights_object_detection_fridge(self, num_masks, mask_res):
        data = load_fridge_object_detection_dataset()
        model = retrieve_fridge_object_detection_model()
        task_type = ModelTask.OBJECT_DETECTION
        class_names = np.array(['can', 'carton',
                                'milk_bottle', 'water_bottle'])
        run_rai_insights(model, data[:2], ImageColumns.LABEL,
                         task_type, class_names,
                         num_masks=num_masks, mask_res=mask_res)

    @pytest.mark.parametrize('num_masks', [-100, -1, 0])
    def test_rai_insights_invalid_num_masks(self, num_masks):
        data = load_fridge_object_detection_dataset()
        model = retrieve_fridge_object_detection_model()
        task_type = ModelTask.OBJECT_DETECTION
        class_names = np.array(['can', 'carton',
                                'milk_bottle', 'water_bottle'])
        with pytest.raises(ValueError,
                           match="num_masks must be greater than 0"):
            run_rai_insights(model, data[:1], ImageColumns.LABEL,
                             task_type, class_names, num_masks=num_masks)

    @pytest.mark.parametrize('mask_res', [-100, -1, 0])
    def test_rai_insights_invalid_mask_res(self, mask_res):
        data = load_fridge_object_detection_dataset()
        model = retrieve_fridge_object_detection_model()
        task_type = ModelTask.OBJECT_DETECTION
        class_names = np.array(['can', 'carton',
                                'milk_bottle', 'water_bottle'])
        with pytest.raises(ValueError,
                           match="mask_res must be greater than 0"):
            run_rai_insights(model, data[:1], ImageColumns.LABEL,
                             task_type, class_names, mask_res=mask_res)

    @pytest.mark.parametrize('device', [None, 'cpu'])
    def test_rai_insights_device(self, device):
        data = load_fridge_object_detection_dataset()
        model = retrieve_fridge_object_detection_model()
        task_type = ModelTask.OBJECT_DETECTION
        class_names = np.array(['can', 'carton',
                                'milk_bottle', 'water_bottle'])
        run_rai_insights(model, data[:1], ImageColumns.LABEL,
                         task_type, class_names, device=device)

    @pytest.mark.parametrize('device', ["bad_device", ""])
    def test_rai_insights_invalid_device(self, device):
        data = load_fridge_object_detection_dataset()
        model = retrieve_fridge_object_detection_model()
        task_type = ModelTask.OBJECT_DETECTION
        class_names = np.array(['can', 'carton',
                                'milk_bottle', 'water_bottle'])
        with pytest.raises(ValueError, match="Selected device is invalid"):
            run_rai_insights(model, data[:1], ImageColumns.LABEL,
                             task_type, class_names, device=device)

    @pytest.mark.skip("This test fails in the build due to \
                      incompatibility between fastai and pytorch \
                      2.0.0. TODO: fix may be to ping pytorch <2.0.0 \
                      in the build until fastai updates.")
    def test_rai_insights_object_detection_fridge_label_format(self):
        data = load_fridge_object_detection_dataset()
        model = retrieve_fridge_object_detection_model()
        task_type = ModelTask.OBJECT_DETECTION
        class_names = np.array(['can', 'carton',
                                'milk_bottle', 'water_bottle'])

        rai_insights = RAIVisionInsights(model, data[:3],
                                         ImageColumns.LABEL,
                                         task_type=task_type,
                                         classes=class_names)
        y = [
            [
                [1, 100, 200, 300, 400, 0.95],
                [2, 100, 200, 300, 400, 0.95],
                [1, 100, 200, 300, 400, 0.95]
            ],
            [
                [1, 100, 200, 300, 400, 0.95],
                [2, 100, 200, 300, 400, 0.95],
            ]
        ]
        result = [
            [2, 1, 0, 0],
            [1, 1, 0, 0]
        ]
        assert rai_insights._format_od_labels(y, class_names) == result

    @pytest.mark.skipif(sys.platform == 'darwin',
                        reason='torch version downgrade on macos')
    @pytest.mark.parametrize("path, transform, size", [
        ("./data/odFridgeObjects/img_transforms_large",
         ImageTransformEnum.RESIZE,
         (1000, 1000)),
        ("./data/odFridgeObjects/img_transforms_gray",
         ImageTransformEnum.GRAYSCALE,
         None),
        ("./data/odFridgeObjects/img_transforms_opacity",
         ImageTransformEnum.OPACITY,
         None),
        ("./data/odFridgeObjects/img_transforms_blackout",
         ImageTransformEnum.BLACKOUT,
         None),
        ("./data/odFridgeObjects/img_transforms_png",
         ImageTransformEnum.PNG,
         None),
    ])
    def test_rai_insights_object_detection_fridge_image_transforms(self,
                                                                   path,
                                                                   transform,
                                                                   size):
        data = load_fridge_object_detection_dataset()[:10]
        data = ImageTransforms(data).apply_transformation(path,
                                                          transform,
                                                          size)
        model = retrieve_fridge_object_detection_model()
        task_type = ModelTask.OBJECT_DETECTION
        class_names = np.array(['can', 'carton',
                                'milk_bottle', 'water_bottle'])
        dropped_features = [i for i in range(0, 10)]
        run_rai_insights(model, data[:3], ImageColumns.LABEL,
                         task_type, class_names,
                         dropped_features=dropped_features)

    @pytest.mark.parametrize(
        'upscale',
        [
            pytest.param(
                True,
                marks=pytest.mark.skip(
                    'Insufficient memory on test machines to load images')),
            False
        ])
    def test_jagged_image_sizes(self, upscale):
        if upscale:
            PIL.Image.MAX_IMAGE_PIXELS = None
        data = load_flowers_dataset(upscale=upscale)
        model = create_dummy_model(data)
        test_data = data
        class_names = data[ImageColumns.LABEL.value].unique()
        task_type = ModelTask.IMAGE_CLASSIFICATION
        run_rai_insights(model, test_data, ImageColumns.LABEL,
                         task_type, class_names, upscale=upscale)


def run_rai_insights(model, test_data, target_column,
                     task_type, classes=None, test_explainer=False,
                     test_error_analysis=False,
                     image_mode=None, dropped_features=None,
                     upscale=False, max_evals=DEFAULT_MAX_EVALS,
                     num_masks=DEFAULT_NUM_MASKS,
                     mask_res=DEFAULT_MASK_RES,
                     device=Device.AUTO.value):
    feature_metadata = None
    if dropped_features:
        feature_metadata = FeatureMetadata(dropped_features=dropped_features)
    image_width = None
    if upscale:
        image_width = 2
    rai_insights = RAIVisionInsights(model, test_data,
                                     target_column,
                                     task_type=task_type,
                                     classes=classes,
                                     image_mode=image_mode,
                                     feature_metadata=feature_metadata,
                                     image_width=image_width,
                                     max_evals=max_evals,
                                     num_masks=num_masks,
                                     mask_res=mask_res,
                                     device=device)
    # Note: this seems too resource-intensive
    # TODO: re-add when we get beefier test machines
    if test_explainer:
        rai_insights.explainer.add()
    if test_error_analysis:
        rai_insights.error_analysis.add()
    if test_explainer or test_error_analysis:
        rai_insights.compute()
    rai_insights.get_data()
    # Validate
    validate_rai_vision_insights(
        rai_insights, test_data,
        target_column, task_type)
