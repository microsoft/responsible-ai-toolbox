// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort } from "@responsible-ai/core-ui";
import { ITheme } from "office-ui-fabric-react";
import React from "react";

import { IPrecomputedExplanations } from "../Interfaces/ExplanationInterfaces";
import { IDataset } from "../Interfaces/IDataset";
import { IExplanationModelMetadata } from "../Interfaces/IExplanationContext";
import { IModelExplanationData } from "../Interfaces/IModelExplanationData";
import { ITelemetryMessage } from "../util/ITelemetryMessage";
import { JointDataset } from "../util/JointDataset";

export interface IModelAssessmentContext {
  dataset: IDataset;
  modelExplanationData: IModelExplanationData;
  theme?: ITheme;
  // Everything below this comment should eventually be removed.
  // Instead, dataset and modelExplanationData should suffice.
  errorCohorts: ErrorCohort[];
  precomputedExplanations?: IPrecomputedExplanations;
  jointDataset: JointDataset;
  modelMetadata: IExplanationModelMetadata;
  telemetryHook: (message: ITelemetryMessage) => void;
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
}

export const defaultModelAssessmentContext: IModelAssessmentContext = {
  dataset: {} as IDataset,
  errorCohorts: [],
  jointDataset: {} as JointDataset,
  modelExplanationData: {} as IModelExplanationData,
  modelMetadata: {} as IExplanationModelMetadata,
  precomputedExplanations: undefined,
  requestLocalFeatureExplanations: undefined,
  requestPredictions: undefined,
  telemetryHook: () => undefined,
  theme: {} as ITheme
};
const modelAssessmentContext = React.createContext<IModelAssessmentContext>(
  defaultModelAssessmentContext
);
export { modelAssessmentContext as ModelAssessmentContext };
