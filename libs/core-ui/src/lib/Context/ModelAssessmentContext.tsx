// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { ICategoricalRange, INumericRange } from "@responsible-ai/mlchartlib";
import React from "react";

import { Cohort } from "../Cohort/Cohort";
import { ErrorCohort } from "../Cohort/ErrorCohort";
import { DatasetCohort } from "../DatasetCohort";
import {
  ICausalAnalysisData,
  ICausalWhatIfData
} from "../Interfaces/ICausalAnalysisData";
import { ICounterfactualData } from "../Interfaces/ICounterfactualData";
import { IDataset } from "../Interfaces/IDataset";
import { IErrorAnalysisData } from "../Interfaces/IErrorAnalysisData";
import {
  IExplanationModelMetadata,
  ModelTypes
} from "../Interfaces/IExplanationContext";
import { IHighchartBoxData } from "../Interfaces/IHighchartBoxData";
import { IHighchartBubbleSDKClusterData } from "../Interfaces/IHighchartBubbleData";
import { IModelExplanationData } from "../Interfaces/IModelExplanationData";
import { ITelemetryEvent } from "../util/ITelemetryEvent";
import { JointDataset } from "../util/JointDataset";

export interface IModelAssessmentContext {
  causalAnalysisData?: ICausalAnalysisData;
  counterfactualData?: ICounterfactualData;
  dataset: IDataset;
  // TODO: the dataset feature ranges should come from backend
  columnRanges?: { [key: string]: INumericRange | ICategoricalRange };
  modelType?: ModelTypes;
  modelExplanationData?: IModelExplanationData;
  errorAnalysisData?: IErrorAnalysisData;
  theme?: ITheme;
  featureFlights?: string[];
  isRefactorFlightOn?: boolean;
  errorCohorts: ErrorCohort[];
  datasetCohorts?: DatasetCohort[];
  readonly baseErrorCohort: ErrorCohort;
  readonly baseDatasetCohort?: DatasetCohort;
  readonly selectedErrorCohort: ErrorCohort;
  readonly selectedDatasetCohort?: DatasetCohort;

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
    filter: unknown[],
    compositeFilter: unknown[],
    xAxis: string,
    yAxis: string,
    abortSignal: AbortSignal
  ) => Promise<IHighchartBubbleSDKClusterData>;
  requestLocalCounterfactuals?: (
    counterfactualsId: string,
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<ICounterfactualData>;
  requestLocalExplanations?: (
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<any>;
  requestLocalCausalEffects?: (
    causalId: string,
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<ICausalAnalysisData>;
  requestTestDataRow?: (
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<any>;
  requestGlobalCausalEffects?: (
    id: string,
    filter: unknown[],
    compositeFilter: unknown[],
    abortSignal: AbortSignal
  ) => Promise<ICausalAnalysisData>;
  requestGlobalCausalPolicy?: (
    id: string,
    filter: unknown[],
    compositeFilter: unknown[],
    abortSignal: AbortSignal
  ) => Promise<ICausalAnalysisData>;
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
  requestMetrics?: (
    filter: unknown[],
    compositeFilter: unknown[],
    metric: string,
    abortSignal: AbortSignal
  ) => Promise<any>;
  requestExp?:
    | ((index: number, abortSignal: AbortSignal) => Promise<any[]>)
    | undefined;
  requestSplinePlotDistribution?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>;
  requestForecast?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<number[]>;
  shiftErrorCohort(cohort: ErrorCohort, datasetCohort?: DatasetCohort): void;
  addCohort(
    cohort: Cohort,
    switchNew?: boolean,
    datasetCohort?: DatasetCohort
  ): void;
  editCohort(
    cohort: Cohort,
    switchNew?: boolean,
    datasetCohort?: DatasetCohort
  ): void;
  deleteCohort(
    cohort: ErrorCohort | DatasetCohort,
    isErrorCohort: boolean
  ): void;
}

export const defaultModelAssessmentContext: IModelAssessmentContext = {
  addCohort: () => undefined,
  baseErrorCohort: {} as ErrorCohort,
  columnRanges: {},
  dataset: {} as IDataset,
  datasetCohorts: [],
  deleteCohort: () => undefined,
  editCohort: () => undefined,
  errorCohorts: [],
  isRefactorFlightOn: undefined,
  jointDataset: {} as JointDataset,
  modelExplanationData: undefined,
  modelMetadata: {} as IExplanationModelMetadata,
  modelType: undefined,
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
