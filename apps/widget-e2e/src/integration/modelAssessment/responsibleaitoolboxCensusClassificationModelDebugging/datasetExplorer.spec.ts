// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeDatasetExplorer,
  modelAssessmentDatasets
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasets.CensusClassificationModelDebugging;
describeDatasetExplorer(datasetShape, "CensusClassificationModelDebugging");
