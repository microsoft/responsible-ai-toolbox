// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeIndividualFeatureImportance,
  modelAssessmentDatasetsIncludingFlights
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasetsIncludingFlights.DiabetesDecisionMakingNewModelOverviewExperience;
describeIndividualFeatureImportance(
  datasetShape,
  "DiabetesDecisionMakingNewModelOverviewExperience"
);
