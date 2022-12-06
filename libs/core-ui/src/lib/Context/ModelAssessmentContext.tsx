// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import React from "react";

import { Cohort } from "../Cohort/Cohort";
import { ErrorCohort } from "../Cohort/ErrorCohort";
import {
  ICausalAnalysisData,
  ICausalWhatIfData
} from "../Interfaces/ICausalAnalysisData";
import { ICounterfactualData } from "../Interfaces/ICounterfactualData";
import { IDataset } from "../Interfaces/IDataset";
import { IErrorAnalysisData } from "../Interfaces/IErrorAnalysisData";
import { IExplanationModelMetadata } from "../Interfaces/IExplanationContext";
import { IHighchartBoxData } from "../Interfaces/IHighchartBoxData";
import { IHighchartBubbleSDKData } from "../Interfaces/IHighchartBubbleData";
import { IModelExplanationData } from "../Interfaces/IModelExplanationData";
import { ITelemetryEvent } from "../util/ITelemetryEvent";
import { JointDataset } from "../util/JointDataset";

export interface IModelAssessmentContext {
  causalAnalysisData?: ICausalAnalysisData;
  counterfactualData?: ICounterfactualData;
  dataset: IDataset;
  modelExplanationData?: IModelExplanationData;
  errorAnalysisData?: IErrorAnalysisData;
  theme?: ITheme;
  featureFlights?: string[];
  errorCohorts: ErrorCohort[];
  readonly baseErrorCohort: ErrorCohort;
  readonly selectedErrorCohort: ErrorCohort;

  // jointDataset and modelMetadata should eventually be removed.
  // Instead, dataset and modelExplanationData should suffice.
  jointDataset: JointDataset;
  modelMetadata: IExplanationModelMetadata;

  telemetryHook: (message: ITelemetryEvent) => void;
  requestCausalWhatIf?: (
    id: string,
    features: unknown[],
    featureName: string,
    newValue: unknown[],
    target: unknown[],
    abortSignal: AbortSignal
  ) => Promise<ICausalWhatIfData[]>;
  requestPredictions:
    | ((request: any[], abortSignal: AbortSignal) => Promise<any[]>)
    | undefined;
  requestLocalFeatureExplanations:
    | ((
        request: any[],
        abortSignal: AbortSignal,
        explanationAlgorithm?: string
      ) => Promise<any[]>)
    | undefined;
  requestBoxPlotDistribution?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<IHighchartBoxData>;
  requestBubblePlotData?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<IHighchartBubbleSDKData>;
  requestLocalCounterfactuals?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>;
  requestDatasetAnalysisBarChart?: (
    filter: unknown[],
    compositeFilter: unknown[],
    columnNameX: string,
    treatColumnXAsCategorical: boolean,
    columnNameY: string,
    treatColumnYAsCategorical: boolean,
    numBins: number,
    abortSignal: AbortSignal
  ) => Promise<any>;
  requestDatasetAnalysisBoxChart?: (
    filter: unknown[],
    compositeFilter: unknown[],
    columnNameX: string,
    columnNameY: string,
    numBins: number,
    abortSignal: AbortSignal
  ) => Promise<any>;
  requestGlobalExplanations?: (
    filter: unknown[],
    compositeFilter: unknown[],
    abortSignal: AbortSignal
  ) => Promise<any>;
  requestExp?:
    | ((index: number, abortSignal: AbortSignal) => Promise<any[]>)
    | undefined;
  shiftErrorCohort(cohort: ErrorCohort): void;
  addCohort(cohort: Cohort, switchNew?: boolean): void;
  editCohort(cohort: Cohort, switchNew?: boolean): void;
  deleteCohort(cohort: ErrorCohort): void;
}

export const defaultModelAssessmentContext: IModelAssessmentContext = {
  addCohort: () => undefined,
  baseErrorCohort: {} as ErrorCohort,
  dataset: {} as IDataset,
  deleteCohort: () => undefined,
  editCohort: () => undefined,
  errorCohorts: [],
  jointDataset: {} as JointDataset,
  modelExplanationData: undefined,
  modelMetadata: {} as IExplanationModelMetadata,
  requestExp: undefined,
  requestLocalFeatureExplanations: undefined,
  requestPredictions: undefined,
  selectedErrorCohort: {} as ErrorCohort,
  shiftErrorCohort: () => undefined,
  telemetryHook: () => undefined,
  theme: {} as ITheme
};
const modelAssessmentContext = React.createContext<IModelAssessmentContext>(
  defaultModelAssessmentContext
);
export { modelAssessmentContext as ModelAssessmentContext };
