// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeVisionDatasetExplorer,
  modelAssessmentDatasets
} from "@responsible-ai/e2e";
const datasetShape = modelAssessmentDatasets.FridgeMultilabelModelDebugging;
describeVisionDatasetExplorer(datasetShape, "FridgeMultilabelModelDebugging");
