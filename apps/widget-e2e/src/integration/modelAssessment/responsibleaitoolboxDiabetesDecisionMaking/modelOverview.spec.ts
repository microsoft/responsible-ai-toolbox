// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeModelOverview,
  modelAssessmentDatasets
} from "@responsible-ai/e2e";

const datasetShape = modelAssessmentDatasets.DiabetesDecisionMaking;
describeModelOverview(datasetShape, "DiabetesDecisionMaking");
