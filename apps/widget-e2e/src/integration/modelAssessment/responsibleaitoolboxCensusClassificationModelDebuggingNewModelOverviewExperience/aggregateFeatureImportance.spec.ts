// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeAggregateFeatureImportance,
  modelAssessmentDatasetsIncludingFlights
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasetsIncludingFlights.CensusClassificationModelDebuggingNewModelOverviewExperience;
describeAggregateFeatureImportance(
  datasetShape,
  "CensusClassificationModelDebuggingNewModelOverviewExperience"
);
