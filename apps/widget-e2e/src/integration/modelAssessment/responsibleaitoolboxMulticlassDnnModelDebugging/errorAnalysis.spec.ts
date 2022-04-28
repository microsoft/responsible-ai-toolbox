// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeErrorAnalysis,
  modelAssessmentDatasets
} from "@responsible-ai/rai-e2e";

const datasetShape = modelAssessmentDatasets.MulticlassDnnModelDebugging;
describeErrorAnalysis(datasetShape, "MulticlassDnnModelDebugging");
