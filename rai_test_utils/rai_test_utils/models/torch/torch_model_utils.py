# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os
import urllib.request as request_file

import torch
import torchvision
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor


# download fine-tuned recycling model from url
def download_assets(filepath, force=False):
    if force or not os.path.exists(filepath):
        url = ("https://publictestdatasets.blob.core.windows.net" +
               "/models/fastrcnn.pt")
        request_file.urlretrieve(url, os.path.join(filepath))
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


def get_object_detection_fridge_model():
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
    return model
