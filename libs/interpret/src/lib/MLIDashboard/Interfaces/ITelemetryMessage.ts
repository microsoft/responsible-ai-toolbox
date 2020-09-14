export enum TelemetryLevels {
  Error = "Error",
  Warning = "Warning",
  Info = "Info",
  Trace = "Trace"
}

export type TelemetryLevel =
  | TelemetryLevels.Error
  | TelemetryLevels.Warning
  | TelemetryLevels.Info
  | TelemetryLevels.Trace;

export interface ITelemetryMessage {
  level: TelemetryLevel;
  message?: string;
  context?: any;
}
