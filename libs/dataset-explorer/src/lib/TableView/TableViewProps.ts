// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IObjectWithKey } from "@fluentui/react";
import {
  ErrorCohort,
  JointDataset,
  ModelTypes,
  ITelemetryEvent
} from "@responsible-ai/core-ui";

export interface ITableViewProps {
  features: string[];
  jointDataset: JointDataset;
  selectedCohort: ErrorCohort;
  modelType?: ModelTypes;
  onAllSelectedItemsChange: (allSelectedItems: IObjectWithKey[]) => void;
  subsetSelectedItems?: IObjectWithKey[];
  telemetryHook?: (message: ITelemetryEvent) => void;
}
