// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeVisionDataExplorer,
  modelAssessmentDatasets
} from "@responsible-ai/e2e";
const datasetShape =
  modelAssessmentDatasets.FridgeImageClassificationModelDebugging;
describeVisionDataExplorer(
  datasetShape,
  "FridgeImageClassificationModelDebugging"
);
