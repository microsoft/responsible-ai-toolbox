// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeDatasetExplorer,
  modelAssessmentDatasetsIncludingFlights
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasetsIncludingFlights.CensusClassificationModelDebuggingNewModelOverviewExperience;
describeDatasetExplorer(
  datasetShape,
  "CensusClassificationModelDebuggingNewModelOverviewExperience"
);
