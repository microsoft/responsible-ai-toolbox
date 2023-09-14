// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeModelAssessmentTextFeatureImportance,
  modelAssessmentDatasets
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasets.BlbooksgenreTextClassificationModelDebugging;
describeModelAssessmentTextFeatureImportance(
  datasetShape,
  "BlbooksgenreTextClassificationModelDebugging"
);
