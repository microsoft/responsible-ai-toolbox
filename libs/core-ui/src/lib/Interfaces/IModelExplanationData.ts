// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPrecomputedExplanations } from "./ExplanationInterfaces";

export interface IModelExplanationData {
  modelClass: ModelClass;
  method?: Method;
  predictedY?: number[];
  probabilityY?: number[][];
  explanationMethod?: string;
  precomputedExplanations?: IPrecomputedExplanations;
}

export type Method = "classifier" | "regressor";
export type ModelClass = "Tree" | "EBM" | "blackbox";
