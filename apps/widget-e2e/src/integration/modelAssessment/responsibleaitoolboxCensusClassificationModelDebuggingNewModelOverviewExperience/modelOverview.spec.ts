// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeNewModelOverview,
  modelAssessmentDatasetsIncludingFlights
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasetsIncludingFlights.CensusClassificationModelDebuggingNewModelOverviewExperience;
describeNewModelOverview(
  datasetShape,
  "CensusClassificationModelDebuggingNewModelOverviewExperience"
);
