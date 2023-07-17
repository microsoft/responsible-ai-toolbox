// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeVisionModelOverview,
  modelAssessmentVisionDatasets
} from "@responsible-ai/e2e";
const datasetShape =
  modelAssessmentVisionDatasets.FridgeObjectDetectionModelDebugging;
describeVisionModelOverview(
  datasetShape,
  "FridgeObjectDetectionModelDebugging"
);
