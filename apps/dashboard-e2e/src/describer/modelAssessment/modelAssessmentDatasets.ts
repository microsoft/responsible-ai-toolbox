// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModelAssessmentData } from "./IModelAssessmentData";

const modelAssessmentDatasets = {
  adultCensusIncomeData: {
    isClassification: true,
    isMulticlass: false
  },
  bostonData: {
    isClassification: false
  },
  wineData: {
    isClassification: true,
    isMulticlass: true
  }
};
const withType: {
  [key in keyof typeof modelAssessmentDatasets]: IModelAssessmentData;
} = modelAssessmentDatasets;

export { withType as modelAssessmentDatasets };
