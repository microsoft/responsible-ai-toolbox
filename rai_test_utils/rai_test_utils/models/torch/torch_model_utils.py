# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import logging
import os
import urllib.request as request_file

module_logger = logging.getLogger(__name__)
module_logger.setLevel(logging.INFO)

try:
    import torch
    import torchvision
    from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
except ImportError:
    module_logger.debug(
        'Could not import torch/torchvision, required for object detection.')


# download fine-tuned recycling model from url
def download_assets(filepath, force=False):
    """Download assets from url if not already downloaded.

    :param filepath: Path to the file to download.
    :type filepath: str
    :param force: Whether to force download the file. Defaults to False.
    :type force: bool, optional
    :returns: Path to the downloaded file.
    :rtype: str
    """
    if force or not os.path.exists(filepath):
        url = ("https://publictestdatasets.blob.core.windows.net" +
               "/models/fastrcnn.pt")
        request_file.urlretrieve(url, os.path.join(filepath))
    else:
        print('Found' + filepath)

    return filepath


def get_instance_segmentation_model(num_classes):
    """Get an instance segmentation model.

    :param num_classes: Number of classes.
    :type num_classes: int
    :returns: Instance segmentation model.
    :rtype: torchvision.models.detection.faster_rcnn.FasterRCNN
    """
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
    """Loads the fridge object detection model.

    :returns: The fridge object detection model.
    :rtype: torchvision.models.detection.faster_rcnn.FasterRCNN
    """
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
