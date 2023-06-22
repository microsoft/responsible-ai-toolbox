# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from typing import List


class VisionExplanationData:
    classNames: List[str]
    images: List[str]
    predictedY: List[str]
    trueY: List[str]
