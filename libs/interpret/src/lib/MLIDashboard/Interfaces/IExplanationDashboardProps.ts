// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  IOfficeFabricProps,
  IExplanationDashboardData,
  IExplanationModelMetadata,
  WeightVectorOption,
  JointDataset
} from "@responsible-ai/core-ui";
import { Dictionary } from "lodash";

import { IStringsParam } from "./IStringsParam";
import { ITelemetryMessage } from "./ITelemetryMessage";

// This is the interface of the data to be provided by any glue code, be it the ModelExplanationController, the Jupyter widget,
// or some future extension. The Explanation Dashboard opperates on this data object, and an optional chart config that specifies
// configurable view information that is orthogonal to this data.
/**
 * @typedef {Object} IKernelExplanationData
 * @property {any[][]} [trainingData] - sample dataset. Dim(rows) x Dim(features)
 * @property {string[]} [featureNames] - pretty-print names for the feature columns. Dim(features)
 * @property {string[]} [classNames] - pretty-print names for the classes. Dim(classes)
 * @property {number[][] | number[][][]} [localExplanations] - local explanations for sample data. [Dim(classes)] x Dim(rows) x Dim(features)
 * @property {number[]} globalExplanation - global explanation data averaged across classes. Dim(features)
 * @property {Array<number | string>} [trueY] - true values for sample data output. Dim(rows)
 * @property {Array<number | string>} [predictedY] - model outputs for sample dataset. Dim(rows)
 * @property {number[][] | number[]} [probabilityY] - model probabilities for output values. Dim(rows) x [Dim(classes)]
 */

export interface IExplanationDashboardProps
  extends IExplanationDashboardData,
    IOfficeFabricProps {
  dashboardType?: "ModelPerformance";
  locale?: string;
  stringParams?: IStringsParam;
  telemetryHook?: (message: ITelemetryMessage) => void;
  requestPredictions?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  requestLocalFeatureExplanations?: (
    request: any[],
    abortSignal: AbortSignal,
    explanationAlgorithm?: string
  ) => Promise<any[]>;
}

export interface INewExplanationDashboardState {
  cohorts: Cohort[];
  activeGlobalTab: GlobalTabKeys;
  jointDataset: JointDataset;
  modelMetadata: IExplanationModelMetadata;
  validationWarnings: string[];
  showingDataSizeWarning: boolean;
  selectedWeightVector: WeightVectorOption;
  requestPredictions?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  weightVectorOptions: WeightVectorOption[];
  weightVectorLabels: Dictionary<string>;
}

export enum GlobalTabKeys {
  ModelPerformance = "modelPerformance",
  DataExploration = "dataExploration",
  ExplanationTab = "explanationTab",
  WhatIfTab = "whatIfTab"
}
