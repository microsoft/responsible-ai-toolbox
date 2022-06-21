// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeDatasetExplorer,
  modelAssessmentDatasetsIncludingFlights
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasetsIncludingFlights.HousingDecisionMakingNewModelOverviewExperience;
describeDatasetExplorer(
  datasetShape,
  "HousingDecisionMakingNewModelOverviewExperience"
);
