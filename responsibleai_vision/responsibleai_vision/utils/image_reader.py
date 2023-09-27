# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Utilities for reading images."""

import base64
from io import BytesIO
from typing import Any, Tuple, Union
from urllib.parse import urlparse

import requests
from numpy import asarray
from PIL import Image
from PIL.ExifTags import TAGS
from requests.adapters import HTTPAdapter, Retry

from responsibleai_vision.common.constants import (AutoMLImagesModelIdentifier,
                                                   CommonTags)

# domain mapped session for reuse
_requests_sessions = {}


def _get_retry_session(url):
    domain = urlparse(url.lower()).netloc
    if domain in _requests_sessions:
        return _requests_sessions[domain]

    session = requests.Session()
    retries = Retry(
        total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504]
    )
    session.mount("http://", HTTPAdapter(max_retries=retries))
    session.mount("https://", HTTPAdapter(max_retries=retries))
    _requests_sessions[domain] = session

    return session


def get_image_pointer_from_path(image_path):
    """Get image pointer from path.

    :param image_path: The path to the image.
    :type image_path: str
    :return: The image open pointer.
    :rtype: str or bytes
    """
    image_open_pointer = image_path
    if image_path.startswith("http://") or image_path.startswith("https://"):
        response = _get_retry_session(image_path).get(image_path)
        image_open_pointer = BytesIO(response.content)
    return image_open_pointer


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
    image_open_pointer = get_image_pointer_from_path(image_path)
    with Image.open(image_open_pointer) as im:
        if image_mode is not None:
            im = im.convert(image_mode)
        image_array = asarray(im)
    return image_array


def get_all_exif_feature_names(image_dataset):
    """Get all exif feature names.

    :param image_dataset: The image dataset.
    :type image_dataset: pandas.DataFrame
    :return: The list of exif feature names.
    :rtype: List[Union[str, int]]]
    """
    exif_feature_names = set()
    for i in range(image_dataset.shape[0]):
        image = image_dataset.iloc[i, 0]
        if isinstance(image, str):
            image_pointer_path = get_image_pointer_from_path(image)
            with Image.open(image_pointer_path) as im:
                exifdata = im.getexif()
                for tag_id in exifdata:
                    # get the tag name, instead of human unreadable tag id
                    tag = TAGS.get(tag_id, tag_id)
                    if tag not in image_dataset.columns:
                        data = exifdata.get(tag_id)
                        if isinstance(data, str) or \
                           isinstance(data, int) or \
                           isinstance(data, float):
                            exif_feature_names.add(tag)
    return list(exif_feature_names)


def get_base64_string_from_path(
    img_path: str, return_image_size: bool = False
) -> Union[str, Tuple[str, Tuple[int, int]]]:
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
