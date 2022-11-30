// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IObjectWithKey } from "@fluentui/react";
import {
  WeightVectorOption,
  ErrorCohort,
  JointDataset,
  ModelTypes,
  ITelemetryEvent
} from "@responsible-ai/core-ui";

export interface IIndividualFeatureImportanceProps {
  allSelectedItems: IObjectWithKey[];
  features: string[];
  jointDataset: JointDataset;
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  onWeightChange: (option: WeightVectorOption) => void;
  selectedCohort: ErrorCohort;
  modelType?: ModelTypes;
  telemetryHook?: (message: ITelemetryEvent) => void;
}
