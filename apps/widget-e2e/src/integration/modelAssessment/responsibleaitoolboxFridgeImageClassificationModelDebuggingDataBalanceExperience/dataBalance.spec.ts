// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    describeDataBalance,
    modelAssessmentDatasets
} from "@responsible-ai/e2e";

const datasetShape =
    modelAssessmentDatasets.FridgeImageClassificationModelDebugging;
describeDataBalance(
    datasetShape,
    "FridgeImageClassificationModelDebugging"
);