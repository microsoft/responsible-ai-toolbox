// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeNewModelOverview,
  modelAssessmentDatasets
} from "@responsible-ai/e2e";

const datasetShape = modelAssessmentDatasets.DiabetesDecisionMaking;
describeNewModelOverview(datasetShape, "DiabetesDecisionMakingNewModelOverviewExperience");
