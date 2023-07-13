// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModelAssessmentData } from "../IModelAssessmentData";

import { FridgeMultilabelModelDebugging } from "./FridgeMultilabelModelDebugging";
import { FridgeObjectDetectionModelDebugging } from "./FridgeObjectDetectionModelDebugging";

const modelAssessmentVisionDatasets: { [name: string]: IModelAssessmentData } =
  {
    FridgeMultilabelModelDebugging,
    FridgeObjectDetectionModelDebugging
  };

const withType: {
  [key in keyof typeof modelAssessmentVisionDatasets]: IModelAssessmentData;
} = modelAssessmentVisionDatasets;

export { withType as modelAssessmentVisionDatasets };
