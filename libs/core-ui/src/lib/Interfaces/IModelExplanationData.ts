// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IMultiClassLocalFeatureImportance,
  IPrecomputedExplanations,
  ISingleClassLocalFeatureImportance
} from "./ExplanationInterfaces";

export interface IModelExplanationData {
  modelClass: "Tree" | "EBM" | "blackbox";
  method?: "classifier" | "regressor";
  predictedY?: number[];
  probabilityY?: number[][];
  explanationMethod?: string;
  precomputedExplanations?: IPrecomputedExplanations;
  localExplanations:
    | IMultiClassLocalFeatureImportance
    | ISingleClassLocalFeatureImportance;
}
