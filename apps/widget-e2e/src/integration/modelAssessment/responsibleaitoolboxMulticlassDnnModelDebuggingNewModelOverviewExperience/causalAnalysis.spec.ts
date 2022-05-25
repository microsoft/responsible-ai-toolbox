// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeCausalAnalysis,
  modelAssessmentDatasets
} from "@responsible-ai/e2e";

const datasetShape = modelAssessmentDatasets.MulticlassDnnModelDebugging;
describeCausalAnalysis(datasetShape, "MulticlassDnnModelDebuggingNewModelOverviewExperience");
