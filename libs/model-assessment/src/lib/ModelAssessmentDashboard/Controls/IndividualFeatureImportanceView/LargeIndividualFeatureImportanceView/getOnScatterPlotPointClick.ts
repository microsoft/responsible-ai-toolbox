// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ILocalExplanations,
  ITelemetryEvent,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";

export async function getLocalExplanationsFromSDK(
  absoluteIndex: number,
  requestLocalExplanations?: (
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<ILocalExplanations>,
  telemetryHook?: ((message: ITelemetryEvent) => void) | undefined
): Promise<unknown> {
  try {
    const result = await requestLocalExplanations?.(
      absoluteIndex,
      new AbortController().signal
    );
    telemetryHook?.({
      level: TelemetryLevels.Trace,
      type: TelemetryEventName.LocalExplanationsFetchSuccess
    });

    return result;
  } catch (error) {
    telemetryHook?.({
      context: error,
      level: TelemetryLevels.Error,
      type: TelemetryEventName.LocalExplanationsFetchError
    });
    return error;
  }
}
