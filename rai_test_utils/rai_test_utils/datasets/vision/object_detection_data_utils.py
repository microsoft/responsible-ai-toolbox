# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os
from zipfile import ZipFile
import pandas as pd
import xml.etree.ElementTree as ET

import urllib.request as request_file


def load_fridge_object_detection_dataset_labels():

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
