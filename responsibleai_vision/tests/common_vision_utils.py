# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import copy
import json
import os
import sys
import time
import xml.etree.ElementTree as ET
from enum import Enum
from zipfile import ZipFile

import numpy as np
import pandas as pd
import shap
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.transforms as transforms
from datasets import load_dataset
from fastai.data.transforms import Normalize
from fastai.learner import load_learner
from fastai.losses import BCEWithLogitsLossFlat
from fastai.metrics import accuracy, accuracy_multi
from fastai.vision import models as fastai_models
from fastai.vision.augment import Resize
from fastai.vision.data import ImageDataLoaders, imagenet_stats
from fastai.vision.learner import vision_learner
from PIL import Image
from sklearn.metrics import f1_score
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.models import load_model
from torch.optim import lr_scheduler
from torch.utils.data import DataLoader, Dataset
from torchvision import models as torchvision_models
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor

from raiutils.common.retries import retry_function
from raiutils.dataset import fetch_dataset
from responsibleai_vision.common.constants import ImageColumns

try:
    from urllib import urlretrieve
except ImportError:
    from urllib.request import urlretrieve


CAN = 'can'
CARTON = 'carton'
MILK_BOTTLE = 'milk_bottle'
WATER_BOTTLE = 'water_bottle'
FRIDGE_MULTILABEL_TARGETS = [CAN, CARTON, MILK_BOTTLE, WATER_BOTTLE]
EPOCHS = 10
LEARNING_RATE = 1e-4
IM_SIZE = 300
BATCH_SIZE = 16
FRIDGE_MODEL_NAME = 'fridge_model'
FRIDGE_MODEL_WINDOWS_NAME = 'fridge_model_windows'
MULTILABEL_FRIDGE_MODEL_NAME = 'multilabel_fridge_model'
MULTILABEL_FRIDGE_MODEL_WINDOWS_NAME = 'multilabel_fridge_model_windows'
WIN = 'win'
IMAGE = ImageColumns.IMAGE.value
LABEL = ImageColumns.LABEL.value
TRAIN = 'train'
VAL = 'val'


def load_imagenet_dataset():
    """Loads the imagenet dataset.

    :return: The imagenet dataset.
    :rtype: pandas.DataFrame
    """
    X, y = shap.datasets.imagenet50()
    # load just the first 10 images
    X = X[:10]
    y = y[:10]
    data = pd.DataFrame(
        columns=[IMAGE, LABEL],
        index=range(X.shape[0]))
    classes = load_imagenet_labels()
    for i in range(X.shape[0]):
        data.iloc[i, 0] = X[i]
        if (y[i] >= 1000):
            y[i] = np.random.randint(1000)
        data.iloc[i, 1] = classes[int(y[i])]
    return data


def load_flowers_dataset(upscale=False):
    """Loads the flowers dataset.

    :return: The flowers dataset.
    :rtype: pandas.DataFrame
    """
    storage_url = 'https://publictestdatasets.blob.core.windows.net/'
    container_path = 'computervision/'
    if upscale:
        container_path += 'upscaleFlowers/'
    else:
        container_path += 'smallFlowers/'
    image1 = storage_url + container_path + 'image_00001.jpg'
    image2 = storage_url + container_path + 'image_00002.jpg'
    images = [image1, image2]
    data = pd.DataFrame(columns=[ImageColumns.IMAGE.value,
                                 ImageColumns.LABEL.value])
    for image_path in images:
        data = data.append({ImageColumns.IMAGE.value: image_path,
                            ImageColumns.LABEL.value: 'pink primrose'},
                           ignore_index=True)
    return data


class DummyFlowersClassifier():
    def __init__(self):
        """Dummy classifier for testing purposes.
        """
        pass

    def __call__(self, X):
        """Predicts the labels for the images.

        :param X: The images to predict the labels for.
        :type X: numpy.ndarray
        :return: The predicted labels.
        :rtype: numpy.ndarray
        """
        shape = X.shape
        return np.array(['pink primrose'] * shape[0])

    def predict(self, X):
        """Predicts the labels for the images.

        :param X: The images to predict the labels for.
        :type X: numpy.ndarray
        :return: The predicted labels.
        :rtype: numpy.ndarray
        """
        shape = X.shape
        return np.array(['pink primrose'] * shape[0])

    def predict_proba(self, X):
        """Predicts the probabilities for the images.

        :param X: The images to predict the probabilities for.
        :type X: numpy.ndarray
        :return: The predicted probabilities.
        :rtype: numpy.ndarray
        """
        shape = X.shape
        probs = [[0, 1]] * shape[0]
        return np.array(probs)


def create_dummy_model(df):
    """Creates a dummy model for testing purposes.

    :param df: dataframe with image paths and labels
    :type df: pandas.DataFrame
    :return: dummy model
    :rtype: DummyFlowersClassifier
    """
    return DummyFlowersClassifier()


def retrieve_unzip_file(download_url, data_file):
    fetch_dataset(download_url, data_file)
    # extract files
    with ZipFile(data_file, "r") as zipfile:
        zipfile.extractall(path="./data")
    # delete zip file
    os.remove(data_file)


def load_fridge_dataset():
    # create data folder if it doesnt exist.
    os.makedirs("data", exist_ok=True)

    # download data
    download_url = ("https://cvbp-secondary.z19.web.core.windows.net/" +
                    "datasets/image_classification/fridgeObjects.zip")
    data_file = "./data/fridgeObjects.zip"
    retrieve_unzip_file(download_url, data_file)
    # get all file names into a pandas dataframe with the labels
    data = pd.DataFrame(columns=[IMAGE, LABEL])
    for folder in os.listdir("./data/fridgeObjects"):
        for file in os.listdir("./data/fridgeObjects/" + folder):
            image_path = "./data/fridgeObjects/" + folder + "/" + file
            data = data.append({IMAGE: image_path, LABEL: folder},
                               ignore_index=True)
    return data


def load_fridge_object_detection_dataset_labels(automl_format=False):

    src_images = "./data/odFridgeObjects/"

    # Path to the annotations
    annotations_folder = os.path.join(src_images, "annotations")

    labels = []
    label_dict = {'can': 1, 'carton': 2, 'milk_bottle': 3, 'water_bottle': 4}

    # Read each annotation
    for filename in os.listdir(annotations_folder):
        if filename.endswith(".xml"):
            root = ET.parse(os.path.join(annotations_folder,
                                         filename)).getroot()

            # Use if need to normalize bounding box coordinates
            if automl_format:
                width = int(root.find("size/width").text)
                height = int(root.find("size/height").text)

            image_labels = []
            for object in root.findall("object"):
                name = object.find("name").text
                xmin = object.find("bndbox/xmin").text
                ymin = object.find("bndbox/ymin").text
                xmax = object.find("bndbox/xmax").text
                ymax = object.find("bndbox/ymax").text
                isCrowd = int(object.find("difficult").text)
                if not automl_format:
                    image_labels.append([
                        # label
                        label_dict[name],
                        # topX. To normalize, divide by width.
                        float(xmin),
                        # topY. To normalize, divide by height.
                        float(ymin),
                        # bottomX. To normalize, divide by width
                        float(xmax),
                        # bottomY. To normalize, divide by height
                        float(ymax),
                        int(isCrowd)
                    ])
                else:
                    image_labels.append({
                        'label': name,
                        'topX': float(xmin) / width,
                        'topY': float(ymin) / height,
                        'bottomX': float(xmax) / width,
                        'bottomY': float(ymax) / height,
                        'isCrowd': int(isCrowd)
                    })
            labels.append(image_labels)

    return labels


def load_image_details():
    src_images = "./data/odFridgeObjects/"

    # Path to the annotations
    annotations_folder = os.path.join(src_images, "annotations")

    image_details = []

    # Read each annotation
    for filename in os.listdir(annotations_folder):
        if filename.endswith(".xml"):
            root = ET.parse(os.path.join(annotations_folder,
                                         filename)).getroot()
            width = int(root.find("size/width").text)
            height = int(root.find("size/height").text)
            image_details.append({
                'width': width,
                'height': height
            })
    return image_details


def load_fridge_object_detection_dataset(automl_format=False):
    # create data folder if it doesnt exist.
    os.makedirs("data", exist_ok=True)

    # download data
    download_url = ("https://cvbp-secondary.z19.web.core.windows.net/" +
                    "datasets/object_detection/odFridgeObjects.zip")
    data_file = "./odFridgeObjects.zip"
    retrieve_unzip_file(download_url, data_file)

    labels = load_fridge_object_detection_dataset_labels(automl_format)
    if automl_format:
        image_details = load_image_details()
        data = pd.DataFrame(columns=[ImageColumns.IMAGE.value,
                                     ImageColumns.IMAGE_DETAILS.value,
                                     ImageColumns.LABEL.value])
    else:
        data = pd.DataFrame(columns=[ImageColumns.IMAGE.value,
                                     ImageColumns.LABEL.value])
    for i, file in enumerate(os.listdir("./data/odFridgeObjects/" + "images")):
        image_path = "./data/odFridgeObjects/" + "images" + "/" + file
        if automl_format:
            row = {
                ImageColumns.IMAGE.value: image_path,
                ImageColumns.IMAGE_DETAILS.value: image_details[i],
                ImageColumns.LABEL.value: labels[i]
            }
        else:
            row = {
                ImageColumns.IMAGE.value: image_path,
                ImageColumns.LABEL.value: labels[i]
            }
        data = data.append(row, ignore_index=True)
    return data


class ImageTransformEnum(Enum):
    '''
    Possible modifications to images
    '''
    RESIZE = "resize"
    GRAYSCALE = "grayscale"
    PNG = "png"
    OPACITY = "opacity"
    BLACKOUT = "blackout"


class ImageTypes(Enum):
    '''
    Possible modifications to images
    '''
    JPEG = ".jpg"
    PNG = ".png"


class ImageTransforms(object):
    def __init__(self, data: pd.DataFrame):
        self.data = data

    def apply_transformation(self,
                             path: str,
                             transform: ImageTransformEnum,
                             size=None):
        '''
        Transforms pd.DataFrame of images and labels into modified images.
        The types of modifications are listed in the ImageTransformEnum
        The schema of this Dataframe should be two columns: str of image path,
        str of image labels.
        '''
        os.makedirs(path, exist_ok=True)
        for i, img_path in (self.data[ImageColumns.IMAGE.value]).iteritems():
            image = Image.open(img_path)
            if transform == ImageTransformEnum.RESIZE:
                image = image.resize(size)
            elif transform == ImageTransformEnum.GRAYSCALE:
                image = image.convert('L')
            elif transform == ImageTransformEnum.OPACITY:
                image_array = np.array(image)
                alpha_channel = np.ones((image_array.shape[0],
                                        image_array.shape[1],
                                        1), dtype='uint8') * 255
                img_alpha = np.concatenate((image_array, alpha_channel),
                                           axis=2)
                image = Image.fromarray(img_alpha)
                print(image)
            elif transform == ImageTransformEnum.BLACKOUT:
                mask = np.zeros_like(image)
                image = Image.fromarray(mask)
            is_png_transform = transform == ImageTransformEnum.PNG
            is_opacity_transform = transform == ImageTransformEnum.OPACITY
            if is_png_transform or is_opacity_transform:
                new_path = path + "/" + str(i) + str(ImageTypes.PNG.value)
                image.save(new_path, 'PNG', quality=1000)
            else:
                new_path = path + "/" + str(i) + str(ImageTypes.JPEG.value)
                image.save(new_path, 'JPEG', quality=1000)
            self.data[i] = new_path
        return self.data


def load_multilabel_fridge_dataset():
    # create data folder if it doesnt exist.
    os.makedirs("data", exist_ok=True)

    # download data
    download_url = ("https://cvbp-secondary.z19.web.core.windows.net/" +
                    "datasets/image_classification/" +
                    "multilabelFridgeObjects.zip")
    folder_path = './data/multilabelFridgeObjects'
    data_file = folder_path + '.zip'
    retrieve_unzip_file(download_url, data_file)

    data = pd.read_csv(folder_path + '/labels.csv')
    data.rename(columns={'filename': IMAGE,
                         'labels': LABEL}, inplace=True)
    image_col = data[IMAGE]
    for i in range(len(image_col)):
        image_col[i] = folder_path + '/images/' + image_col[i]
    return data


def convert_images_to_numpy(dataset):
    images = []
    for i in range(len(dataset)):
        images.append(np.array(dataset.iloc[i, 0]))
    dataset[IMAGE] = images
    return dataset


def get_pd_mnist_data(dataset):
    data = pd.DataFrame({IMAGE: dataset[IMAGE],
                         LABEL: dataset[LABEL]})
    return convert_images_to_numpy(data)


def load_mnist_dataset():
    dataset = load_dataset("mnist")
    train_data = get_pd_mnist_data(dataset[TRAIN])
    test_data = get_pd_mnist_data(dataset['test'])
    return train_data, test_data


def load_imagenet_labels():
    # getting ImageNet 1000 class names
    url = "https://s3.amazonaws.com/deep-learning-models/" + \
          "image-models/imagenet_class_index.json"
    with open(shap.datasets.cache(url)) as file:
        class_names = [v[1] for v in json.load(file).values()]
    return class_names


class ImageClassificationPipelineSerializer(object):
    def save(self, model, path):
        model_path = self._get_model_path(path)
        model.save(model_path)

    def load(self, path):
        model_path = self._get_model_path(path)
        return ResNetPipeline.load(model_path)

    def _get_model_path(self, path):
        return os.path.join(path, 'image-classification-model')


class DummyFlowersPipelineSerializer(object):
    def save(self, model, path):
        pass

    def load(self, path):
        return DummyFlowersClassifier()


class ResNetPipeline(object):
    def __init__(self):
        self.model = ResNet50(weights='imagenet')

    def __call__(self, X):
        tmp = X.copy()
        preprocess_input(tmp)
        return self.model(tmp)

    def save(self, path):
        self.model.save(path)

    @staticmethod
    def load(path):
        model = load_model(path)
        inst = ResNetPipeline.__new__(ResNetPipeline)
        inst.model = model
        return inst


def create_image_classification_pipeline():
    return ResNetPipeline()


def train_fastai_image_classifier(df):
    """Trains a fastai multiclass image classifier.

    :param df: dataframe with image paths and labels
    :type df: pandas.DataFrame
    :return: fastai vision learner
    :rtype: fastai.vision.learner
    """
    data = ImageDataLoaders.from_df(
        df, valid_pct=0.2, seed=10, bs=BATCH_SIZE,
        batch_tfms=[Resize(IM_SIZE), Normalize.from_stats(*imagenet_stats)])
    model = vision_learner(data, fastai_models.resnet18, metrics=[accuracy])
    model.unfreeze()
    model.fit(EPOCHS, LEARNING_RATE)
    return model


def train_fastai_image_multilabel(df):
    """Trains fastai image classifier for multilabel classification

    :param df: dataframe with image paths and labels
    :type df: pandas.DataFrame
    :return: trained fastai model
    :rtype: fastai.vision.learner.Learner
    """
    data = ImageDataLoaders.from_df(
        df, valid_pct=0.2, seed=10, label_delim=' ', bs=BATCH_SIZE,
        batch_tfms=[Resize(IM_SIZE), Normalize.from_stats(*imagenet_stats)])
    model = vision_learner(data, fastai_models.resnet18,
                           metrics=[accuracy_multi],
                           loss_func=BCEWithLogitsLossFlat())
    model.unfreeze()
    model.fit(EPOCHS, LEARNING_RATE)
    return model


class FetchModel(object):
    def __init__(self, multilabel=False):
        self.multilabel = multilabel

    def fetch(self):
        if sys.platform.startswith(WIN):
            if self.multilabel:
                model_name = MULTILABEL_FRIDGE_MODEL_WINDOWS_NAME
            else:
                model_name = FRIDGE_MODEL_WINDOWS_NAME
        else:
            if self.multilabel:
                model_name = MULTILABEL_FRIDGE_MODEL_NAME
            else:
                model_name = FRIDGE_MODEL_NAME
        url = ('https://publictestdatasets.blob.core.windows.net/models/' +
               model_name)
        saved_model_name = FRIDGE_MODEL_NAME
        if self.multilabel:
            saved_model_name = MULTILABEL_FRIDGE_MODEL_NAME
        urlretrieve(url, saved_model_name)


def retrieve_or_train_fridge_model(df, force_train=False,
                                   multilabel=False):
    """Retrieves or trains fastai image classifier

    :param df: dataframe with image paths and labels
    :type df: pandas.DataFrame
    :param force_train: whether to force training of model
    :type force_train: bool
    :param multilabel: whether to train multilabel classifier
    :type multilabel: bool
    """
    model_name = FRIDGE_MODEL_NAME
    if multilabel:
        model_name = MULTILABEL_FRIDGE_MODEL_NAME
    if force_train:
        if multilabel:
            model = train_fastai_image_multilabel(df)
        else:
            model = train_fastai_image_classifier(df)
        # Save model to disk
        model.export(model_name)
    else:
        fetcher = FetchModel(multilabel)
        action_name = "Fridge model download"
        err_msg = "Failed to download model"
        max_retries = 4
        retry_delay = 60
        retry_function(fetcher.fetch, action_name, err_msg,
                       max_retries=max_retries,
                       retry_delay=retry_delay)
        model = load_learner(model_name)
    return model


def get_object_detection_model(num_classes=5):
    """Loads a general pretrained FasterRCNN model.

    :param num_classes: Number of classes
    :type num_classes: int
    """
    # load an instance segmentation model pre-trained on COCO
    model = torchvision_models.detection.fasterrcnn_resnet50_fpn(pretrained=True)  # noqa: E501
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    # replace the pre-trained head with a new one
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, num_classes)

    return model


def download_object_detection_assets(filepath, force=False):
    """Downloads the fine-tuned recycling model from url.

    :param filepath: Path to model file
    :type filepath: str
    """
    if force or not os.path.exists(filepath):
        blob_storage_url = "https://publictestdatasets.blob.core.windows.net/"
        models = "models/"
        rcnn_url = blob_storage_url + models + "fastrcnn.pt"
        fetch_dataset(rcnn_url, os.path.join(filepath))
    else:
        print('Found' + filepath)

    return filepath


def retrieve_fridge_object_detection_model():
    """Retrieves the recycling model fine-tuned on fridge.
    """
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    num_classes = 5
    model = get_object_detection_model(num_classes)

    # To use general torchvision pretrained model,
    # comment above and uncomment below
    # model = detection.fasterrcnn_resnet50_fpn(pretrained=True)

    model.to(device)

    return model


def gridify_fridge_multilabel_labels(data):
    """Converts multilabel fridge labels to one-hot encoded labels

    :param data: dataframe with image paths and labels
    :type data: pandas.DataFrame
    :return: dataframe with one-hot encoded labels
    :rtype: pandas.DataFrame
    """
    data_len = len(data)
    can = np.zeros(data_len)
    carton = np.zeros(data_len)
    milk_bottle = np.zeros(data_len)
    water_bottle = np.zeros(data_len)
    for i in range(len(data)):
        labels = data.iloc[i]['label']
        labels = set(labels.split(' '))
        if CAN in labels:
            can[i] = 1
        if CARTON in labels:
            carton[i] = 1
        if MILK_BOTTLE in labels:
            milk_bottle[i] = 1
        if WATER_BOTTLE in labels:
            water_bottle[i] = 1
    data[CAN] = can
    data[CARTON] = carton
    data[MILK_BOTTLE] = milk_bottle
    data[WATER_BOTTLE] = water_bottle
    data.drop(columns=ImageColumns.LABEL.value, inplace=True)
    return data


def train_model(model, dataloaders, criterion, optimizer, scheduler,
                dataset_sizes, num_epochs=25):
    since = time.time()

    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0

    for epoch in range(num_epochs):
        print(f'Epoch {epoch}/{num_epochs - 1}')
        print('-' * 10)

        preds_list = []
        labels_list = []

        # Each epoch has a training and validation phase
        for phase in [TRAIN, VAL]:
            if phase == TRAIN:
                model.train()  # Set model to training mode
            else:
                model.eval()   # Set model to evaluate mode

            running_loss = 0.0
            running_corrects = 0

            # Iterate over data.
            for inputs, labels in dataloaders[phase]:
                # zero the parameter gradients
                optimizer.zero_grad()

                # forward
                # track history if only in train
                with torch.set_grad_enabled(phase == TRAIN):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    # backward + optimize only if in training phase
                    if phase == TRAIN:
                        loss.backward()
                        optimizer.step()

                # statistics
                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

                preds_list.extend(preds.tolist())
                labels_list.extend(labels.data.tolist())
            if phase == TRAIN:
                scheduler.step()

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]
            f1_results = f1_score(labels_list, preds_list, average='micro')
            print(f'{phase} F1: {f1_results:.4f}')
            print(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

            # deep copy the model
            if phase == VAL and epoch_acc > best_acc:
                best_acc = epoch_acc
                best_model_wts = copy.deepcopy(model.state_dict())

        print()

    time_elapsed = time.time() - since
    mins = time_elapsed // 60
    secs = time_elapsed % 60
    print(f'Training complete in {mins:.0f}m {secs:.0f}s')
    print(f'Best val Acc: {best_acc:4f}')

    # load best model weights
    model.load_state_dict(best_model_wts)
    return model


class ImageDataset(Dataset):
    def __init__(self, data, transform=None):
        self.data = data
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        image_data = self.data[IMAGE][idx]
        if self.transform is not None:
            image_data = self.transform(image_data)
        return image_data, self.data[LABEL][idx]


def create_pytorch_vision_model(train_data, test_data, num_classes=10):
    model_ft = torchvision_models.resnet18(pretrained=False)
    num_ftrs = model_ft.fc.in_features
    model_ft.conv1 = nn.Conv2d(1, 64, kernel_size=(7, 7), stride=(2, 2),
                               padding=(3, 3), bias=False)
    model_ft.fc = nn.Linear(num_ftrs, num_classes)

    criterion = nn.CrossEntropyLoss()

    # Observe that all parameters are being optimized
    optimizer_ft = optim.SGD(model_ft.parameters(), lr=0.001, momentum=0.9)

    # Decay LR by a factor of 0.1 every 7 epochs
    exp_lr_scheduler = lr_scheduler.StepLR(
        optimizer_ft, step_size=7, gamma=0.1)

    stacked_data = np.stack(train_data[IMAGE])

    mean = stacked_data.mean()
    std = stacked_data.std()

    # set transformation option
    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.RandomAffine(degrees=30),
        transforms.RandomPerspective(),
        transforms.ToTensor(),
        transforms.Normalize(mean, std)])

    batch_size = 128
    dataset_sizes = {TRAIN: len(train_data), VAL: len(test_data)}
    train_data = ImageDataset(train_data, transform=transform)
    test_data = ImageDataset(test_data, transform=transform)
    dataloaders = {TRAIN: DataLoader(train_data, batch_size=batch_size,
                                     shuffle=True, num_workers=4),
                   VAL: DataLoader(test_data, batch_size=batch_size,
                                   shuffle=False, num_workers=4)}

    model_ft = train_model(model_ft, dataloaders, criterion, optimizer_ft,
                           exp_lr_scheduler, dataset_sizes, num_epochs=1)
    return model_ft
