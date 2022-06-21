// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeWhatIf,
  modelAssessmentDatasetsIncludingFlights
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasetsIncludingFlights.MulticlassDnnModelDebuggingNewModelOverviewExperience;
describeWhatIf(
  datasetShape,
  "MulticlassDnnModelDebuggingNewModelOverviewExperience"
);
