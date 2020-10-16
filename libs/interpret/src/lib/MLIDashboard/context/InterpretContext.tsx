// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dictionary } from "lodash";
import React from "react";

import { Cohort } from "../Cohort";
import { ITelemetryMessage } from "../Interfaces/ITelemetryMessage";
import { WeightVectorOption } from "../IWeightedDropdownContext";
import { JointDataset } from "../JointDataset";

export interface IInterpretContext {
  cohorts: Cohort[];
  globalImportanceIntercept: number[];
  globalImportance: number[][];
  jointDataset: JointDataset;
  weightVectorLabels: Dictionary<string>;
  weightVectorOptions: WeightVectorOption[];
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
  telemetryHook: () => undefined,
  weightVectorLabels: {},
  weightVectorOptions: []
});
export { interpretContext as InterpretContext };
