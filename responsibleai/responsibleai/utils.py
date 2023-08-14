# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum
from io import BytesIO
import numpy as np
from PIL import Image
import timeit
from requests.adapters import HTTPAdapter, Retry
from urllib.parse import urlparse
import requests


# domain mapped session for reuse
_requests_sessions = {}

class ImageColumns(str, Enum):
    """Provide constants related to the input image dataframe columns.

    Can be 'image_url', 'image' or 'label'.
    """

    IMAGE_URL = 'image_url'
    IMAGE = 'image'
    LABEL = 'label'
    IMAGE_DETAILS = 'image_details'

def _measure_time(manager_compute_func):
    def compute_wrapper(*args, **kwargs):
        _separator(80)
        start_time = timeit.default_timer()
        manager_compute_func(*args, **kwargs)
        elapsed = timeit.default_timer() - start_time
        m, s = divmod(elapsed, 60)
        print('Time taken: {0} min {1} sec'.format(
              m, s))
        _separator(80)
    return compute_wrapper


def _separator(max_len):
    print('=' * max_len)


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
        response = _get_retry_session(image_path).get(image_path)
        image_open_pointer = BytesIO(response.content)
    with Image.open(image_open_pointer) as im:
        if image_mode is not None:
            im = im.convert(image_mode)
        image_array = np.asarray(im)
    return image_array


def convert_images(dataset, image_mode):
    """Converts the images to the format required by the model.

    If the images are base64 encoded, they are decoded and converted to
    numpy arrays. If the images are already numpy arrays, they are
    returned as is.

    :param dataset: The dataset to convert.
    :type dataset: numpy.ndarray
    :param image_mode: The mode to open the image in.
        See pillow documentation for all modes:
        https://pillow.readthedocs.io/en/stable/handbook/concepts.html
    :type image_mode: str
    :return: The converted dataset.
    :rtype: numpy.ndarray
    """
    if len(dataset) > 0 and isinstance(dataset[0], str):
        try:
            dataset = np.array([get_image_from_path(
                x, image_mode) for x in dataset])
        except ValueError:
            # if images of different sizes, try to convert one by one
            jagged = np.empty(len(dataset), dtype=object)
            for i, x in enumerate(dataset):
                jagged[i] = get_image_from_path(x, image_mode)
            dataset = jagged
    return dataset


def get_images(dataset, image_mode, transformations=None):
    """Get the images from the dataset.

    If transformations are provided as a callable, the images
    are transformed. If transformations are provided as a string,
    the images are retrieved from that column name in the test dataset.

    :param dataset: The dataset to get the images from.
    :type dataset: numpy.ndarray
    :param image_mode: The mode to open the image in.
        See pillow documentation for all modes:
        https://pillow.readthedocs.io/en/stable/handbook/concepts.html
    :type image_mode: str
    :param transformations: The transformations to apply to the images.
    :type transformations: torchvision.transforms
    :return: The images.
    :rtype: numpy.ndarray
    """
    IMAGE = ImageColumns.IMAGE.value
    IMAGE_URL = ImageColumns.IMAGE_URL.value
    column_names = dataset.columns
    is_transformations_str = isinstance(transformations, str)
    if is_transformations_str:
        images = dataset[transformations]
    else:
        if IMAGE in column_names:
            images = dataset[IMAGE]
        elif IMAGE_URL in column_names:
            images = dataset[IMAGE_URL]
        else:
            raise ValueError('No image column found in test data')

    images = np.array(images.tolist())
    converted_images = convert_images(images, image_mode)

    if not is_transformations_str and transformations is not None:
        converted_images = transformations(converted_images)

    return converted_images
