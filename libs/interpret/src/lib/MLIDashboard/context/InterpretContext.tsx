// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  IExplanationModelMetadata,
  IPrecomputedExplanations,
  JointDataset
} from "@responsible-ai/core-ui";
import React from "react";

import { ITelemetryMessage } from "../Interfaces/ITelemetryMessage";

export interface IInterpretContext {
  cohorts: Cohort[];
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

export const defaultInterpretContext: IInterpretContext = {
  cohorts: [],
  jointDataset: {} as JointDataset,
  modelMetadata: {} as IExplanationModelMetadata,
  precomputedExplanations: undefined,
  requestLocalFeatureExplanations: undefined,
  requestPredictions: undefined,
  telemetryHook: () => undefined
};
const interpretContext = React.createContext<IInterpretContext>(
  defaultInterpretContext
);
export { interpretContext as InterpretContext };
