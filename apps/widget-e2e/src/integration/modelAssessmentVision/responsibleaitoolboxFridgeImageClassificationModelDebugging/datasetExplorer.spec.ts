// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeVisionDatasetExplorer,
  modelAssessmentVisionDatasets
} from "@responsible-ai/e2e";
const datasetShape =
  modelAssessmentVisionDatasets.FridgeImageClassificationModelDebugging;
describeVisionDatasetExplorer(
  datasetShape,
  "FridgeImageClassificationModelDebugging"
);
