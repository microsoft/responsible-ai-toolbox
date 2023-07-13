// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModelAssessmentData } from "../IModelAssessmentData";

import { FridgeImageClassificationModelDebugging } from "./FridgeImageClassificationModelDebugging";

const modelAssessmentVisionDatasets: { [name: string]: IModelAssessmentData } =
  {
    FridgeImageClassificationModelDebugging
  };

const withType: {
  [key in keyof typeof modelAssessmentVisionDatasets]: IModelAssessmentData;
} = modelAssessmentVisionDatasets;

export { withType as modelAssessmentVisionDatasets };