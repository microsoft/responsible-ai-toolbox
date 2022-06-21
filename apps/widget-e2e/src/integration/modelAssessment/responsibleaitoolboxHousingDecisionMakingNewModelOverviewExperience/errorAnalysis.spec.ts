// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeErrorAnalysis,
  modelAssessmentDatasetsIncludingFlights
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasetsIncludingFlights.HousingDecisionMakingNewModelOverviewExperience;
describeErrorAnalysis(
  datasetShape,
  "HousingDecisionMakingNewModelOverviewExperience"
);
