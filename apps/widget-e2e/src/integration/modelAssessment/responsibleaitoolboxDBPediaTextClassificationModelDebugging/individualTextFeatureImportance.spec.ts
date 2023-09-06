// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeModelAssessmentTextFeatureImportance,
  modelAssessmentDatasets
} from "@responsible-ai/e2e";

const datasetShape =
  modelAssessmentDatasets.DBPediaTextClassificationModelDebugging;
if (!datasetShape) {
  throw new Error(
    "Missing feature importances on DBPediaTextClassificationModelDebugging"
  );
}
describeModelAssessmentTextFeatureImportance(
  datasetShape,
  "DBPediaTextClassificationModelDebugging"
);
