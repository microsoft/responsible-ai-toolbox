import { IModelMetadata } from "@responsible-ai/mlchartlib";
import { PredictionTypeV2 } from "./IFairnessProps";

export interface IFairnessContext {
  // rows by [aug columns + feature columns + trueY + groupIndex]
  dataset: any[];
  trueY: number[];
  // modelPredictions, models x rows
  predictions: number[][];
  groupNames: string[];
  binVector: number[];
  modelMetadata: IFairnessModelMetadata;
  modelNames: string[];
}

export interface IFairnessModelMetadata extends IModelMetadata {
  PredictionTypeV2: PredictionTypeV2;
}
