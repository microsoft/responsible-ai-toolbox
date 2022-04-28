// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeModelStatistics,
  modelAssessmentDatasets
} from "@responsible-ai/rai-e2e";

const datasetShape = modelAssessmentDatasets["DiabetesDecisionMaking"];
describeModelStatistics(datasetShape, "DiabetesDecisionMaking");
