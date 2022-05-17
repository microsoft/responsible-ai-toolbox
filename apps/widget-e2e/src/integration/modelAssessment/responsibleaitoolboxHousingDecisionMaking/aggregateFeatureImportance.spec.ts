// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeAggregateFeatureImportance,
  modelAssessmentDatasets
} from "@responsible-ai/e2e";

const datasetShape = modelAssessmentDatasets.HousingDecisionMaking;
describeAggregateFeatureImportance(datasetShape, "HousingDecisionMaking");
