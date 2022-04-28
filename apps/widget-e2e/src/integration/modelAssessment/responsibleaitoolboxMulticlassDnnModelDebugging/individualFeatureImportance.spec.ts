// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeIndividualFeatureImportance,
  modelAssessmentDatasets
} from "@responsible-ai/rai-e2e";

const datasetShape = modelAssessmentDatasets["MulticlassDnnModelDebugging"];
describeIndividualFeatureImportance(
  datasetShape,
  "MulticlassDnnModelDebugging"
);
