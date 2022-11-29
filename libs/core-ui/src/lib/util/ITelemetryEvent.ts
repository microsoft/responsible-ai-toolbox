// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TelemetryEventName } from "./TelemetryEventName";

export enum TelemetryLevels {
  ButtonClick = "ButtonClick",
  Error = "Error",
  Warning = "Warning",
  Info = "Info",
  Trace = "Trace"
}

export type TelemetryLevel =
  | TelemetryLevels.ButtonClick
  | TelemetryLevels.Error
  | TelemetryLevels.Warning
  | TelemetryLevels.Info
  | TelemetryLevels.Trace;

export interface ITelemetryEvent {
  context?: any;
  level: TelemetryLevel;
  message?: string;
  type?: TelemetryEventName;
}
