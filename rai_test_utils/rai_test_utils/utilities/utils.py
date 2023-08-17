# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os
import uuid
from io import BytesIO
from urllib.parse import urlparse
import numpy as np
import requests
from PIL import Image
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry


# domain mapped session for reuse
_requests_sessions = {}


def is_valid_uuid(id: str):
    """Check if the given id is a valid uuid.

    :param id: The id to check.
    :type id: str
    :return: True if the id is a valid uuid, False otherwise.
    :rtype: bool
    """
    try:
        uuid.UUID(str(id))
        return True
    except ValueError:
        return False


def retrieve_dataset(dataset, **kwargs):
    """Retrieve a dataset.

    :param dataset: The dataset to retrieve.
    :type dataset: str
    :return: The dataset.
    :rtype: object
    """
    # if data not extracted, download zip and extract
    outdirname = 'datasets.4.27.2021'
    if not os.path.exists(outdirname):
        try:
            from urllib import urlretrieve
        except ImportError:
            from urllib.request import urlretrieve
        import zipfile
        zipfilename = outdirname + '.zip'
        urlretrieve(
            'https://publictestdatasets.blob.core.windows.net/data/' +
            zipfilename, zipfilename
        )
        with zipfile.ZipFile(zipfilename, 'r') as unzip:
            unzip.extractall('.')
    extension = os.path.splitext(dataset)[1]
    filepath = os.path.join(outdirname, dataset)
    if extension == '.npz':
        # sparse format file
        from scipy.sparse import load_npz
        return load_npz(filepath)
    elif extension == '.svmlight':
        from sklearn import datasets
        return datasets.load_svmlight_file(filepath)
    elif extension == '.json':
        import json
        with open(filepath, encoding='utf-8') as f:
            dataset = json.load(f)
        return dataset
    elif extension == '.csv':
        import pandas as pd
        return pd.read_csv(filepath, **kwargs)
    else:
        raise Exception('Unrecognized file extension: ' + extension)


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
    IMAGE = "image"
    IMAGE_URL = "image_url"

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
