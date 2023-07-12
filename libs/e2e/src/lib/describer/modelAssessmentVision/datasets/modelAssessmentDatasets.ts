// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";

import { IModelAssessmentData } from "../IModelAssessmentData";

import { FridgeImageClassificationModelDebugging } from "./FridgeImageClassificationModelDebugging";

export const regExForNumbersWithBrackets = /^\((\d+)\)$/; // Ex: (60)

const modelAssessmentDatasets: { [name: string]: IModelAssessmentData } = {
  FridgeImageClassificationModelDebugging
};

const modelAssessmentDatasetsDataBalanceExperience: {
  [name: string]: IModelAssessmentData;
} = _.chain(modelAssessmentDatasets)
  .cloneDeep()
  .mapKeys((_v, k: string) => `${k}DataBalanceExperience`)
  .value();

const withType: {
  [key in keyof typeof modelAssessmentDatasets]: IModelAssessmentData;
} = modelAssessmentDatasets;

const allDatasets = {
  ...modelAssessmentDatasets,
  ...modelAssessmentDatasetsDataBalanceExperience
};
const allWithType: {
  [key in keyof typeof allDatasets]: IModelAssessmentData;
} = Object.assign(modelAssessmentDatasetsDataBalanceExperience);

export {
  withType as modelAssessmentDatasets,
  allWithType as modelAssessmentDatasetsIncludingFlights
};
