# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import copy
import json
import os
import sys
import tempfile

import pytest
import torch
from common_vision_utils import load_fridge_dataset
from test_rai_vision_insights import run_rai_insights

from responsibleai_vision import ModelTask
from responsibleai_vision.common.constants import ImageColumns

try:
    import azureml.automl.core.shared.constants as shared_constants
    import mlflow
    from azureml.automl.dnn.vision.classification.common.constants import \
        ModelNames
    from azureml.automl.dnn.vision.classification.models import ModelFactory
    from azureml.automl.dnn.vision.common.mlflow.mlflow_model_wrapper import \
        MLFlowImagesModelWrapper
    from azureml.automl.dnn.vision.common.model_export_utils import (
        _get_mlflow_signature, _get_scoring_method)
except Exception:
    pass


def get_automl_images_mlflow_model(class_names):
    model_name = ModelNames.SERESNEXT
    multilabel = False
    with tempfile.TemporaryDirectory() as tmp_output_dir:
        task_type = shared_constants.Tasks.IMAGE_CLASSIFICATION
        number_of_classes = len(class_names)
        model_wrapper = ModelFactory().get_model_wrapper(
            model_name,
            number_of_classes,
            multilabel=multilabel,
            device='cpu',
            distributed=False,
            local_rank=0,
        )
        model_wrapper.labels = class_names
        # mock for Mlflow model generation
        model_file = os.path.join(tmp_output_dir, 'model.pt')
        torch.save(
            {
                'model_name': model_name,
                'number_of_classes': number_of_classes,
                'model_state': copy.deepcopy(model_wrapper.state_dict()),
                'specs': {
                    'multilabel': model_wrapper.multilabel,
                    'model_settings': model_wrapper.model_settings,
                    'labels': model_wrapper.labels,
                },
            },
            model_file,
        )
        settings_file = os.path.join(
            tmp_output_dir,
            shared_constants.MLFlowLiterals.MODEL_SETTINGS_FILENAME,
        )
        remote_path = os.path.join(tmp_output_dir, 'outputs')

        with open(settings_file, 'w') as f:
            json.dump({}, f)

        conda_env = {
            'channels': ['conda-forge', 'pytorch'],
            'dependencies': [
                'python=3.7',
                'numpy==1.21.6',
                'pytorch==1.7.1',
                'torchvision==0.12.0',
                {'pip': ['azureml-automl-dnn-vision']},
            ],
            'name': 'azureml-automl-dnn-vision-env',
        }

        mlflow_model_wrapper = MLFlowImagesModelWrapper(
            model_settings={},
            task_type=task_type,
            scoring_method=_get_scoring_method(task_type),
        )
        mlflow.pyfunc.save_model(
            path=remote_path,
            python_model=mlflow_model_wrapper,
            artifacts={'model': model_file, 'settings': settings_file},
            conda_env=conda_env,
            signature=_get_mlflow_signature(task_type),
        )
        return mlflow.pyfunc.load_model(remote_path)


class TestRAIVisionInsightsAutoMLImages(object):
    # Skip for older versions of python
    # as azureml-automl-dnn-vision works with '>=3.7,<3.8'
    @pytest.mark.skipif(
        sys.version_info < (3, 7),
        reason='azureml-automl-dnn-vision not supported for older versions',
    )
    @pytest.mark.skipif(
        sys.version_info > (3, 8),
        reason='azureml-automl-dnn-vision not supported for newer versions',
    )
    @pytest.mark.skipif(
        sys.platform.startswith("darwin"),
        reason='azureml-automl-dnn-vision fails to install on macos',
    )
    def test_rai_insights_automl_image_classification_fridge(self):
        data = load_fridge_dataset()
        task_type = ModelTask.IMAGE_CLASSIFICATION
        class_names = data[ImageColumns.LABEL.value].unique().tolist()
        try:
            model = get_automl_images_mlflow_model(class_names)
        except Exception as exp:
            print(
                'Failed to retrieve or load automl'
                ' images mlflow model: {}'.format(exp)
            )
        run_rai_insights(
            model,
            data[:3],
            ImageColumns.LABEL,
            task_type,
            class_names,
            test_explainer=True,  # enabled as gradcam is faster
        )
