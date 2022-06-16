// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeErrorAnalysis,
  modelAssessmentDatasets
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasets.CensusClassificationModelAssessment;
describeErrorAnalysis(datasetShape, "CensusClassificationModelAssessment");
