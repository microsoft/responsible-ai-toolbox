// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPrecomputedExplanations } from "./ExplanationInterfaces";

export interface IModelExplanationData {
  modelClass?: ModelClass;
  method?: Method;
  predictedY?: number[] | number[][] | string[];
  probabilityY?: number[][];
  explanationMethod?: string;
  precomputedExplanations?: IPrecomputedExplanations;
}

export type Method =
  | "classifier"
  | "regressor"
  | "imageclassifier"
  | "textclassifier";
export type ModelClass = "Tree" | "EBM" | "blackbox";
