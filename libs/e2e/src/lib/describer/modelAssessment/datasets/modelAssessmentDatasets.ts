// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";

import { IModelAssessmentData } from "../IModelAssessmentData";

import { CensusClassificationModelDebugging } from "./CensusClassificationModelDebugging";
import { DiabetesDecisionMaking } from "./DiabetesDecisionMaking";
import { DiabetesRegressionModelDebugging } from "./DiabetesRegressionModelDebugging";
import { FridgeImageClassificationModelDebugging } from "./FridgeImageClassificationModelDebugging";
import { FridgeMultilabelModelDebugging } from "./FridgeMultilabelModelDebugging";
import { FridgeObjectDetectionModelDebugging } from "./FridgeObjectDetectionModelDebugging";
import { HousingClassificationModelDebugging } from "./HousingClassificationModelDebugging";
import { HousingDecisionMaking } from "./HousingDecisionMaking";
import { HousingRegression } from "./HousingRegression";
import { MulticlassDnnModelDebugging } from "./MulticlassDnnModelDebugging";

export const regExForNumbersWithBrackets = /^\((\d+)\)$/; // Ex: (60)

const modelAssessmentDatasets: { [name: string]: IModelAssessmentData } = {
  CensusClassificationModelDebugging,
  DiabetesDecisionMaking,
  DiabetesRegressionModelDebugging,
  FridgeImageClassificationModelDebugging,
  FridgeMultilabelModelDebugging,
  FridgeObjectDetectionModelDebugging,
  HousingClassificationModelDebugging,
  HousingDecisionMaking,
  HousingRegression,
  MulticlassDnnModelDebugging
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
