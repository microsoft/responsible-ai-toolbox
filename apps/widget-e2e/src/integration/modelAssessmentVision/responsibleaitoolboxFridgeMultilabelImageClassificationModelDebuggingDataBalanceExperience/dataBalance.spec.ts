// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeVisionDataBalance,
  modelAssessmentVisionDatasets
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentVisionDatasets.FridgeMultilabelModelDebugging;
describeVisionDataBalance(datasetShape, "FridgeMultilabelModelDebuggingDataBalanceExperience");
