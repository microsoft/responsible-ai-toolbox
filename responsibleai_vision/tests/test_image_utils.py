# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from collections import Counter
from http.client import HTTPMessage
from math import isclose
from unittest.mock import Mock, patch
from urllib.parse import urlparse

import numpy as np
from common_vision_utils import (load_clearsight_object_detection_dataset,
                                 load_fridge_object_detection_dataset)

from responsibleai_vision.common.constants import ImageColumns
from responsibleai_vision.utils.image_reader import \
    _get_retry_session as image_reader_get_retry_session
from responsibleai_vision.utils.image_reader import \
    _requests_sessions as image_reader_requests_sessions
from responsibleai_vision.utils.image_reader import get_all_exif_feature_names
from responsibleai_vision.utils.image_utils import (
    _NOLABEL, BOTTOM_X, BOTTOM_Y, HEIGHT, IS_CROWD, TOP_X, TOP_Y, WIDTH,
    classes_to_dict, generate_od_error_labels,
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
        sessions_before_test = len(image_reader_requests_sessions)
        urls = [f"https://{i}.com/image.png" for i in range(10)]
        duplicates = urls.copy()
        urls.extend(duplicates)
        domains = [urlparse(d.lower()).netloc for d in urls]
        domain_unique_count = len(Counter(domains))

        for url in urls:
            image_reader_get_retry_session(url)

        new_session_count = len(image_reader_requests_sessions)
        new_session_count -= sessions_before_test
        assert new_session_count == domain_unique_count

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
        assert len(exif_feature_names) == 60

    def test_get_all_clearsight_feature_names(self):
        image_dataset = load_clearsight_object_detection_dataset().head(2)
        exif_feature_names = get_all_exif_feature_names(image_dataset)
        assert len(exif_feature_names) == 64

    def test_generate_od_error_labels(self):
        true_y = np.array([[[3, 142, 257, 395, 463, 0]],
                           [[3, 107, 272, 240, 501, 0],
                            [1, 261, 274, 393, 449, 0]],
                           [[4, 139, 253, 339, 506, 0]],
                           [[2, 100, 173, 233, 521, 0]],
                           [[1, 175, 253, 355, 416, 0]],
                           [[2, 86, 102, 216, 439, 0],
                            [3, 150, 377, 445, 490, 0]],
                           [[3, 103, 272, 358, 475, 0]],
                           [[4, 65, 289, 436, 414, 0]],
                           [[1, 130, 271, 367, 467, 0]],
                           [[1, 144, 260, 318, 429, 0]]])
        pred_y = np.array([[[3, 140, 260, 396, 469, 0]],
                           [[3, 108, 270, 237, 505, 0],
                            [1, 259, 271, 401, 450, 0]],
                           [[4, 131, 250, 330, 485, 0]],
                           [[2, 97, 170, 241, 516, 0]],
                           [[1, 175, 250, 354, 414, 0]],
                           [[2, 83, 98, 222, 445, 0],
                            [3, 130, 366, 438, 496, 0]],
                           [[3, 104, 265, 360, 468, 0]],
                           [[4, 58, 284, 483, 420, 0]],
                           [[1, 128, 265, 367, 471, 0]],
                           [[1, 137, 260, 325, 430, 0]]])
        class_names = ["can", "carton", "milk_bottle", "water_bottle"]
        error_labels = generate_od_error_labels(true_y, pred_y, class_names)
        assert len(error_labels) == 10
        assert error_labels[0]['aggregate'] == "1 correct, 0 incorrect"
        assert error_labels[0]['correct'] == "1 milk_bottle"
        assert error_labels[0]['incorrect'] == _NOLABEL
