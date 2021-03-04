// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPrecomputedExplanations } from "./ExplanationInterfaces";

export interface IModelExplanationData {
  modelClass: "Tree" | "EBM" | "blackbox";
  method?: "classifier" | "regressor";
  predictedY?: number[];
  probabilityY?: number[][];
  explanationMethod?: string;
  precomputedExplanations?: IPrecomputedExplanations;
}
