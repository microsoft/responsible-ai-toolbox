// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModelAssessmentData } from "../IModelAssessmentData";

import { FridgeObjectDetectionModelDebugging } from "./FridgeObjectDetectionModelDebugging";

const modelAssessmentVisionDatasets: { [name: string]: IModelAssessmentData } =
  {
    FridgeObjectDetectionModelDebugging
  };

const withType: {
  [key in keyof typeof modelAssessmentVisionDatasets]: IModelAssessmentData;
} = modelAssessmentVisionDatasets;

export { withType as modelAssessmentVisionDatasets };
