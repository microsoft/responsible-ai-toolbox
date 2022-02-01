// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModelAssessmentData } from "./IModelAssessmentData";

const modelAssessmentDatasets = {
  wineData: {
    isClassification: true,
    isMulticlass: true
  },
  adultCensusIncomeData: {
    isClassification: true,
    isMulticlass: false
  },
  bostonData: {
    isClassification: false
  }
};
const withType: {
  [key in keyof typeof modelAssessmentDatasets]: IModelAssessmentData;
} = modelAssessmentDatasets;

export { withType as modelAssessmentDatasets };
