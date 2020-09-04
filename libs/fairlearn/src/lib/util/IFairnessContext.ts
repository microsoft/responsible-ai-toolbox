import { IModelMetadata } from "@responsible-ai/mlchartlib";
import { PredictionType } from "../IFairnessProps";

export interface IBaseFairnessContext {
  trueY: number[];
  // modelPredictions, models x rows
  predictions: number[][];
  groupNames: string[];
  binVector: number[];
  modelNames: string[];
}
export interface IPreComputedFairnessContext extends IBaseFairnessContext {
  dataset?: never;
  modelMetadata: IFairnessModelMetadata;
}
export interface IRunTimeFairnessContext extends IBaseFairnessContext {
  // rows by [aug columns + feature columns + trueY + groupIndex]
  dataset: any[][];
  modelMetadata: Required<IFairnessModelMetadata>;
}

export type IFairnessContext =
  | IPreComputedFairnessContext
  | IRunTimeFairnessContext;

export interface IFairnessModelMetadata extends IModelMetadata {
  PredictionType: PredictionType;
}
