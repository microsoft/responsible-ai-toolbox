// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeWhatIfForecasting,
  modelAssessmentDatasets
} from "@responsible-ai/e2e";

const datasetShape = modelAssessmentDatasets.OrangeJuiceForecasting;
describeWhatIfForecasting(
  datasetShape,
  "OrangeJuiceForecasting"
);
