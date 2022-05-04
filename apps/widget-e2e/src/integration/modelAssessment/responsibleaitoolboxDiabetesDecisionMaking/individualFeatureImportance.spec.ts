// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeIndividualFeatureImportance,
  modelAssessmentDatasets
} from "@responsible-ai/e2e";

const datasetShape = modelAssessmentDatasets.DiabetesDecisionMaking;
describeIndividualFeatureImportance(datasetShape, "DiabetesDecisionMaking");
