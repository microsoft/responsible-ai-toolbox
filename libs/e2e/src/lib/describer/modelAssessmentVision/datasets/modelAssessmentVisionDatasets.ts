// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModelAssessmentData } from "../IModelAssessmentData";

import { FridgeMultilabelModelDebugging } from "./FridgeMultilabelModelDebugging";

const modelAssessmentVisionDatasets: { [name: string]: IModelAssessmentData } =
  {
    FridgeMultilabelModelDebugging
  };

const withType: {
  [key in keyof typeof modelAssessmentVisionDatasets]: IModelAssessmentData;
} = modelAssessmentVisionDatasets;

export { withType as modelAssessmentVisionDatasets };
