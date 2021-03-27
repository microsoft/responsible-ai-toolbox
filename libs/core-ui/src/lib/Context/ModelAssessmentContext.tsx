// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITelemetryMessage } from "../util/ITelemetryMessage";
import { ITheme } from "office-ui-fabric-react";
import React from "react";
import { IPrecomputedExplanations } from "../Interfaces/ExplanationInterfaces";
import { IDataset } from "../Interfaces/IDataset";
import { IExplanationModelMetadata } from "../Interfaces/IExplanationContext";
import { IModelExplanationData } from "../Interfaces/IModelExplanationData";
import { JointDataset } from "../util/JointDataset";
import { ErrorCohort } from "@responsible-ai/core-ui";

export interface IModelAssessmentContext {
  dataset: IDataset;
  modelExplanationData: IModelExplanationData;
  theme?: ITheme;
  // Everything below this comment should eventually be removed.
  // Instead, dataset and modelExplanationData should suffice.
  cohorts: ErrorCohort[];
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
  modelExplanationData: {} as IModelExplanationData,
  theme: {} as ITheme,
  cohorts: [],
  jointDataset: {} as JointDataset,
  modelMetadata: {} as IExplanationModelMetadata,
  precomputedExplanations: undefined,
  requestLocalFeatureExplanations: undefined,
  requestPredictions: undefined,
  telemetryHook: () => undefined
};
const modelAssessmentContext = React.createContext<IModelAssessmentContext>(
  defaultModelAssessmentContext
);
export { modelAssessmentContext as ModelAssessmentContext };
