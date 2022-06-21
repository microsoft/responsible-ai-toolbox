// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeCausalAnalysis,
  modelAssessmentDatasetsIncludingFlights
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasetsIncludingFlights.MulticlassDnnModelDebuggingNewModelOverviewExperience;
describeCausalAnalysis(
  datasetShape,
  "MulticlassDnnModelDebuggingNewModelOverviewExperience"
);
