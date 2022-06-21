// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeIndividualFeatureImportance,
  modelAssessmentDatasetsIncludingFlights
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasetsIncludingFlights.MulticlassDnnModelDebuggingNewModelOverviewExperience;
describeIndividualFeatureImportance(
  datasetShape,
  "MulticlassDnnModelDebuggingNewModelOverviewExperience"
);
