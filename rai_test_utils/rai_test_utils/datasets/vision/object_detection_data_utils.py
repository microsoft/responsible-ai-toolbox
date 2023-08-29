# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os
import urllib.request as request_file
import xml.etree.ElementTree as ET
from io import BytesIO
from urllib.parse import urlparse
from zipfile import ZipFile

import numpy as np
import pandas as pd
import requests
from PIL import Image
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

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


def load_fridge_object_detection_dataset_labels():
    """Loads the labels for the fridge object detection dataset.

    return: list of labels
    rtype: list
    """

    src_images = "./data/odFridgeObjects/"

    # Path to the annotations
    annotations_folder = os.path.join(src_images, "annotations")

    labels = []
    label_dict = {'can': 1, 'carton': 2, 'milk_bottle': 3, 'water_bottle': 4}

    # Read each annotation
    for _, filename in enumerate(os.listdir(annotations_folder)):
        if filename.endswith(".xml"):
            print("Parsing " + os.path.join(src_images, filename))

            root = ET.parse(
                os.path.join(annotations_folder, filename)
            ).getroot()

            # use if needed
            # width = int(root.find("size/width").text)
            # height = int(root.find("size/height").text)

            image_labels = []
            for object in root.findall("object"):
                name = object.find("name").text
                xmin = object.find("bndbox/xmin").text
                ymin = object.find("bndbox/ymin").text
                xmax = object.find("bndbox/xmax").text
                ymax = object.find("bndbox/ymax").text
                isCrowd = int(object.find("difficult").text)
                image_labels.append([
                    label_dict[name],  # label
                    float(xmin),  # topX. To normalize, divide by width.
                    float(ymin),  # topY. To normalize, divide by height.
                    float(xmax),  # bottomX. To normalize, divide by width
                    float(ymax),  # bottomY. To normalize, divide by height
                    int(isCrowd)
                ])
            labels.append(image_labels)

    return labels


def load_fridge_object_detection_dataset():
    """Loads the fridge object detection dataset.

    return: pandas dataframe with image paths and labels
    rtype: pd.DataFrame
    """
    # create data folder if it doesnt exist.
    os.makedirs("data", exist_ok=True)

    # download data
    download_url = ("https://cvbp-secondary.z19.web.core.windows.net/" +
                    "datasets/object_detection/odFridgeObjects.zip")
    data_file = "./odFridgeObjects.zip"
    request_file.urlretrieve(download_url, filename=data_file)

    # extract files
    with ZipFile(data_file, "r") as zip:
        print("extracting files...")
        zip.extractall(path="./data")
        print("done")
    # delete zip file
    os.remove(data_file)

    labels = load_fridge_object_detection_dataset_labels()

    # get all file names into a pandas dataframe with the labels
    data = pd.DataFrame(columns=["image", "label"])
    for i, file in enumerate(os.listdir("./data/odFridgeObjects/" + "images")):
        image_path = "./data/odFridgeObjects/" + "images" + "/" + file
        data = data.append({"image": image_path,
                            "label": labels[i]},  # folder
                           ignore_index=True)

    return data
