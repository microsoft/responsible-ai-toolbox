# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Utilities for reading images."""

import base64
from io import BytesIO
from typing import Any, Tuple, Union

import requests
from numpy import asarray
from PIL import Image

from responsibleai_vision.common.constants import (AutoMLImagesModelIdentifier,
                                                   CommonTags)


def get_image_from_path(image_path, image_mode):
    """Get image from path.

    :param image_path: The path to the image.
    :type image_path: str
    :param image_mode: The mode to open the image in.
        See pillow documentation for all modes:
        https://pillow.readthedocs.io/en/stable/handbook/concepts.html
    :type image_mode: str
    :return: The image as a numpy array.
    :rtype: numpy.ndarray
    """
    image_open_pointer = image_path
    if image_path.startswith("http://") or image_path.startswith("https://"):
        response = requests.get(image_path)
        image_open_pointer = BytesIO(response.content)
    with Image.open(image_open_pointer) as im:
        if image_mode is not None:
            im = im.convert(image_mode)
        image_array = asarray(im)
    return image_array


def get_base64_string_from_path(img_path: str,
                                return_image_size: bool = False) \
        -> Union[str, Tuple[str, Tuple[int, int]]]:
    """Load and convert pillow image to base64-encoded image

    :param img_path: image path
    :type img_path: str
    :param return_image_size: true if image size should also be returned
    :type return_image_size: bool
    :return: base64-encoded image OR base64-encoded image and image size
    :rtype: Union[str, Tuple[str, Tuple[int, int]]]
    """
    try:
        img = Image.open(img_path)
    except Exception as e:
        print("file not found", str(e))
        import urllib.request
        urllib.request.urlretrieve(img_path, "tempfile")
        img = Image.open("tempfile")
    imgio = BytesIO()
    img.save(imgio, img.format)
    img_str = base64.b64encode(imgio.getvalue())
    if return_image_size:
        return img_str.decode(CommonTags.IMAGE_DECODE_UTF_FORMAT), img.size
    return img_str.decode(CommonTags.IMAGE_DECODE_UTF_FORMAT)


def is_automl_image_model(model: Any) -> bool:
    """Check whether the model is automl images mlflow type

    :param model: Model object
    :type model: supported model types
    :return: True if automl model type else False
    :rtype: bool
    """
    automl_image_model = False
    model_type = str(type(model))
    if model_type.endswith(
        AutoMLImagesModelIdentifier.AUTOML_IMAGE_CLASSIFICATION_MODEL
    ) or model_type.endswith(
        AutoMLImagesModelIdentifier.AUTOML_OBJECT_DETECTION_MODEL
    ):
        automl_image_model = True
    return automl_image_model
