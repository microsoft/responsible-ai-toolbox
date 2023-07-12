// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";

import { IModelAssessmentData } from "../IModelAssessmentData";

import { FridgeObjectDetectionModelDebugging } from "./FridgeObjectDetectionModelDebugging";

export const regExForNumbersWithBrackets = /^\((\d+)\)$/; // Ex: (60)

const modelAssessmentVisionDatasets: { [name: string]: IModelAssessmentData } = {
  FridgeObjectDetectionModelDebugging
};

const withType: {
  [key in keyof typeof modelAssessmentVisionDatasets]: IModelAssessmentData;
} = modelAssessmentVisionDatasets;

export {
  withType as modelAssessmentVisionDatasets
};
