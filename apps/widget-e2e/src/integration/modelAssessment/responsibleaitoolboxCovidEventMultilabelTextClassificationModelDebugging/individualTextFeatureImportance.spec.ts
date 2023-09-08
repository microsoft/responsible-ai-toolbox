// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeModelAssessmentTextFeatureImportance,
  modelAssessmentDatasets
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasets.CovidTextClassificationModelDebugging;
describeModelAssessmentTextFeatureImportance(
  datasetShape,
  "CovidTextClassificationModelDebugging"
);
