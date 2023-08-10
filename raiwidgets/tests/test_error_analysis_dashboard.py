# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from zipfile import ZipFile
import numpy as np
import os
import pandas as pd
import pytest
import shap
import sklearn
from interpret.ext.blackbox import MimicExplainer
from interpret.ext.glassbox import LGBMExplainableModel
from interpret_community.common.constants import ModelTask
from sklearn.datasets import load_iris, make_classification
from sklearn.model_selection import train_test_split

try:
    import torch
    import torchvision
    from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
    torch_installed = True
except ImportError:
    torch_installed = False

import urllib.request as request_file
import xml.etree.ElementTree as ET

from erroranalysis._internal.constants import Metrics, metric_to_display_name
from erroranalysis._internal.surrogate_error_tree import (
    DEFAULT_MAX_DEPTH, DEFAULT_MIN_CHILD_SAMPLES, DEFAULT_NUM_LEAVES)
from raiwidgets import ErrorAnalysisDashboard
from raiwidgets.explanation_constants import WidgetRequestResponseConstants


class TestErrorAnalysisDashboard:
    def test_error_analysis_adult_census(self):
        X, y = shap.datasets.adult()
        y = [1 if r else 0 for r in y]
        categorical_features = ['Workclass',
                                'Education-Num',
                                'Marital Status',
                                'Occupation',
                                'Relationship',
                                'Race',
                                'Sex',
                                'Country']
        run_error_analysis_adult_census(X, y, categorical_features)

    def test_error_analysis_many_rows(self):
        X, y = make_classification(n_samples=110000)

        # Split data into train and test
        X_train, X_test, y_train, y_test = train_test_split(X,
                                                            y,
                                                            test_size=0.2,
                                                            random_state=0)
        classes = np.unique(y_train).tolist()
        feature_names = ["col" + str(i) for i in list(range(X_train.shape[1]))]
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)
        knn = sklearn.neighbors.KNeighborsClassifier()
        knn.fit(X_train, y_train)
        ErrorAnalysisDashboard(model=knn, dataset=X_test,
                               true_y=y_test, classes=classes)

    def test_error_analysis_sample_dataset_with_many_more_rows(self):
        X, y = make_classification(n_samples=400000)

        # Split data into train and test
        X_train, X_test, y_train, y_test = train_test_split(X,
                                                            y,
                                                            test_size=0.2,
                                                            random_state=0)
        classes = np.unique(y_train).tolist()
        feature_names = ["col" + str(i) for i in list(range(X_train.shape[1]))]
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)
        logreg = sklearn.linear_model.LogisticRegression()
        logreg.fit(X_train, y_train)
        _, X_test_sample, _, y_test_sample = train_test_split(X_test,
                                                              y_test,
                                                              test_size=0.01,
                                                              random_state=0)
        ErrorAnalysisDashboard(model=logreg,
                               dataset=X_test,
                               true_y=y_test_sample,
                               true_y_dataset=y_test,
                               classes=classes,
                               sample_dataset=X_test_sample)

        pred_y = logreg.predict(X_test)
        pred_y_sample = logreg.predict(X_test_sample)
        ErrorAnalysisDashboard(dataset=X_test,
                               true_y=y_test_sample,
                               true_y_dataset=y_test,
                               classes=classes,
                               sample_dataset=X_test_sample,
                               pred_y=pred_y_sample,
                               pred_y_dataset=pred_y)

    def test_error_analysis_pandas(self):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        # Validate error analysis dashboard on pandas DataFrame
        # and pandas Series
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)
        y_train = pd.Series(y_train)
        y_test = pd.Series(y_test)

        knn = sklearn.neighbors.KNeighborsClassifier()
        knn.fit(X_train, y_train)

        model_task = ModelTask.Classification
        explainer = MimicExplainer(knn,
                                   X_train,
                                   LGBMExplainableModel,
                                   model_task=model_task)
        global_explanation = explainer.explain_global(X_test)

        ErrorAnalysisDashboard(global_explanation,
                               knn,
                               dataset=X_test,
                               true_y=y_test)

    def test_error_analysis_iris_numeric_feature_names(self):
        # e2e test of error analysis with numeric feature names
        X_train, X_test, y_train, y_test, _, _ = create_iris_data()
        knn = sklearn.neighbors.KNeighborsClassifier()
        knn.fit(X_train, y_train)

        model_task = ModelTask.Classification
        explainer = MimicExplainer(knn,
                                   X_train,
                                   LGBMExplainableModel,
                                   model_task=model_task)
        global_explanation = explainer.explain_global(X_test)

        dashboard = ErrorAnalysisDashboard(global_explanation,
                                           knn,
                                           dataset=X_test,
                                           true_y=y_test)
        metric = metric_to_display_name[Metrics.ERROR_RATE]
        result = dashboard.input.debug_ml([global_explanation.features,
                                           [],
                                           [],
                                           DEFAULT_MAX_DEPTH,
                                           DEFAULT_NUM_LEAVES,
                                           DEFAULT_MIN_CHILD_SAMPLES,
                                           metric])
        assert WidgetRequestResponseConstants.ERROR not in result
        matrix_features = global_explanation.features[0:1]
        result = dashboard.input.matrix(matrix_features, [], [],
                                        True, 8, metric)
        assert WidgetRequestResponseConstants.ERROR not in result

    def test_error_analysis_adult_census_numeric_feature_names(self):
        X, y = shap.datasets.adult()
        categorical_features = ['Workclass',
                                'Education-Num',
                                'Marital Status',
                                'Occupation',
                                'Relationship',
                                'Race',
                                'Sex',
                                'Country']
        columns = X.columns.tolist()
        cat_idxs = [columns.index(feat) for feat in categorical_features]
        # Convert to numpy to remove features names
        X = X.values
        y = [1 if r else 0 for r in y]

        run_error_analysis_adult_census(X, y, cat_idxs)

    @pytest.mark.skipif(not torch_installed,
                        reason="requires torch & torchvision")
    def test_error_analysis_fridge_object_detection(self):
        model = get_object_detection_model()
        dataset = load_fridge_object_detection_dataset()
        classes = np.array(['can', 'carton', 'milk_bottle', 'water_bottle'])

        X_test = dataset[["image"]]
        y_test = dataset[["label"]]
        ErrorAnalysisDashboard(model=model, dataset=X_test,
                               true_y=y_test, classes=classes)


def get_object_detection_model():
    # download fine-tuned recycling model from url
    def download_assets(filepath, force=False):
        if force or not os.path.exists(filepath):
            request_file.urlretrieve(
                "https://publictestdatasets.blob.core.windows.net\
                /models/fastrcnn.pt",
                os.path.join(filepath))
        else:
            print('Found' + filepath)

        return filepath

    def get_instance_segmentation_model(num_classes):
        # load an instance segmentation model pre-trained on COCO
        model = torchvision.models.detection.fasterrcnn_resnet50_fpn(
            pretrained=True
        )
        in_features = model.roi_heads.box_predictor.cls_score.in_features
        # replace the pre-trained head with a new one
        model.roi_heads.box_predictor = FastRCNNPredictor(
            in_features,
            num_classes
        )
        return model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    num_classes = 5
    model = get_instance_segmentation_model(num_classes)
    _ = download_assets('Recycling_finetuned_FastRCNN.pt')
    model.load_state_dict(
        torch.load('Recycling_finetuned_FastRCNN.pt',
                   map_location=device
                   )
    )

    model.to(device)


def load_fridge_object_detection_dataset_labels():

    src_images = "./data/odFridgeObjects/"

    # Path to the annotations
    annotations_folder = os.path.join(src_images, "annotations")

    labels = []
    label_dict = {'can': 1, 'carton': 2, 'milk_bottle': 3, 'water_bottle': 4}

    # Read each annotation
    for i, filename in enumerate(os.listdir(annotations_folder)):
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


def run_error_analysis_adult_census(X, y, categorical_features):
    X, y = sklearn.utils.resample(
        X, y, n_samples=1000, random_state=7, stratify=y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=7, stratify=y)

    knn = sklearn.neighbors.KNeighborsClassifier()
    knn.fit(X_train, y_train)

    model_task = ModelTask.Classification
    explainer = MimicExplainer(knn,
                               X_train,
                               LGBMExplainableModel,
                               augment_data=True,
                               max_num_of_augmentations=10,
                               model_task=model_task)
    global_explanation = explainer.explain_global(X_test)

    dashboard = ErrorAnalysisDashboard(
        global_explanation, knn, dataset=X_test,
        true_y=y_test, categorical_features=categorical_features)
    metric = metric_to_display_name[Metrics.ERROR_RATE]
    result = dashboard.input.debug_ml([global_explanation.features,
                                       [],
                                       [],
                                       DEFAULT_MAX_DEPTH,
                                       DEFAULT_NUM_LEAVES,
                                       DEFAULT_MIN_CHILD_SAMPLES,
                                       metric])
    assert WidgetRequestResponseConstants.ERROR not in result
    matrix_features = global_explanation.features[0:1]
    result = dashboard.input.matrix(matrix_features, [], [],
                                    True, 8, metric)
    assert WidgetRequestResponseConstants.ERROR not in result


def create_iris_data():
    # Import Iris dataset
    iris = load_iris()
    # Split data into train and test
    X_train, X_test, y_train, y_test = train_test_split(
        iris.data, iris.target, test_size=0.2, random_state=0)
    feature_names = iris.feature_names
    classes = iris.target_names
    return X_train, X_test, y_train, y_test, feature_names, classes
