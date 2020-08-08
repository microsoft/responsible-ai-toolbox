export enum TelemetryLevels {
    error = "Error",
    warning = "Warning",
    info = "Info",
    trace = "Trace",
}

export type TelemetryLevel =
    | TelemetryLevels.error
    | TelemetryLevels.warning
    | TelemetryLevels.info
    | TelemetryLevels.trace;

export interface ITelemetryMessage {
    level: TelemetryLevel;
    message?: string;
    context?: any;
}
