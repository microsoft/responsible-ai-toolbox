# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from collections import Counter
from http.client import HTTPMessage
from math import isclose
from unittest.mock import Mock, patch
from urllib.parse import urlparse

import numpy as np
from common_vision_utils import load_fridge_object_detection_dataset

from responsibleai_vision.common.constants import ImageColumns
from responsibleai_vision.utils.image_reader import \
    _get_retry_session as image_reader_get_retry_session
from responsibleai_vision.utils.image_reader import \
    _requests_sessions as image_reader_requests_sessions
from responsibleai_vision.utils.image_reader import get_all_exif_feature_names
from responsibleai_vision.utils.image_utils import (
    BOTTOM_X, BOTTOM_Y, HEIGHT, IS_CROWD, TOP_X, TOP_Y, WIDTH, classes_to_dict,
    transform_object_detection_labels)

LABEL = ImageColumns.LABEL.value
IMAGE_DETAILS = ImageColumns.IMAGE_DETAILS.value
TOL = 1


class TestImageUtils(object):
    def test_transform_object_detection_labels(self):
        data = load_fridge_object_detection_dataset(automl_format=True)
        class_names = np.array(
            ["can", "carton", "milk_bottle", "water_bottle"]
        )
        data_transformed = transform_object_detection_labels(
            data.copy(), LABEL, class_names
        )
        label_dict = classes_to_dict(class_names)
        for i in range(len(data)):
            original_label = data[LABEL][i]
            label = data_transformed[LABEL][i]
            image_details = data[IMAGE_DETAILS][i]
            width = image_details[WIDTH]
            height = image_details[HEIGHT]
            assert isinstance(label, list)
            for j in range(len(label)):
                label_j = label[j]
                assert len(label_j) == 6
                o_label_j = original_label[j]
                assert label_j[0] == label_dict[o_label_j[LABEL]]
                # use is close for off by one errors due to rounding
                assert isclose(
                    label_j[1], o_label_j[TOP_X] * width, abs_tol=TOL
                )
                assert isclose(
                    label_j[2], o_label_j[TOP_Y] * height, abs_tol=TOL
                )
                assert isclose(
                    label_j[3], o_label_j[BOTTOM_X] * width, abs_tol=TOL
                )
                assert isclose(
                    label_j[4], o_label_j[BOTTOM_Y] * height, abs_tol=TOL
                )
                assert label_j[5] == o_label_j[IS_CROWD]

    def test_retry_sessions_match_domain_count(self):
        urls = [f"https://{i}.com/image.png" for i in range(10)]
        duplicates = urls.copy()
        urls.extend(duplicates)
        domains = [urlparse(d.lower()).netloc for d in urls]
        domain_unique_count = len(Counter(domains))

        for url in urls:
            image_reader_get_retry_session(url)

        assert len(image_reader_requests_sessions) == domain_unique_count

    @patch("urllib3.connectionpool.HTTPConnectionPool._make_request")
    def test_retry_sessions_retries_on_conn_failure(self, request_mock):
        url = "http://mock.com/test.png"

        # requests_send_mock.side_effect =
        request_mock.side_effect = [
            IOError(),
            Mock(status=500, msg=HTTPMessage("test")),
            Mock(status=200, msg=HTTPMessage("test")),
        ]
        session = image_reader_get_retry_session(url)

        assert session.get(url).status_code == 200

    def test_get_all_exif_feature_names(self):
        image_dataset = load_fridge_object_detection_dataset().head(2)
        exif_feature_names = get_all_exif_feature_names(image_dataset)
        assert len(exif_feature_names) == 11
        assert set(exif_feature_names) == \
            set(['Orientation', 'ExifOffset', 'ImageWidth', 'GPSInfo',
                 'Model', 'DateTime', 'YCbCrPositioning', 'ImageLength',
                 'ResolutionUnit', 'Software', 'Make'])
