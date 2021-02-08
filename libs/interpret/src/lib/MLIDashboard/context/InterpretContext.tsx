// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";

import { Cohort } from "../Cohort";
import { ITelemetryMessage } from "../Interfaces/ITelemetryMessage";
import { JointDataset } from "@responsible-ai/core-ui";

export interface IInterpretContext {
  cohorts: Cohort[];
  globalImportanceIntercept: number[];
  globalImportance: number[][];
  jointDataset: JointDataset;
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

const interpretContext = React.createContext<IInterpretContext>({
  cohorts: [],
  globalImportance: [],
  globalImportanceIntercept: [],
  jointDataset: {} as JointDataset,
  requestLocalFeatureExplanations: undefined,
  requestPredictions: undefined,
  telemetryHook: () => undefined
});
export { interpretContext as InterpretContext };
