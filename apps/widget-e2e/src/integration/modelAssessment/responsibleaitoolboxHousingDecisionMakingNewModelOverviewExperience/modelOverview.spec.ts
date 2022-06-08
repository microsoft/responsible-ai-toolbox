// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeNewModelOverview,
  modelAssessmentDatasetsIncludingFlights
} from "@responsible-ai/e2e";

const datasetShape = modelAssessmentDatasetsIncludingFlights.HousingDecisionMakingNewModelOverviewExperience;
describeNewModelOverview(
  datasetShape,
  "HousingDecisionMakingNewModelOverviewExperience"
);
