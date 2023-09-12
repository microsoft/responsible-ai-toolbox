// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICounterfactualData,
  ITelemetryEvent,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";

export async function getLocalCounterfactualsFromSDK(
  absoluteIndex: number,
  counterfactualsId: string,
  requestLocalCounterfactuals?: (
    counterfactualsId: string,
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<Record<string, unknown> | ICounterfactualData>,
  telemetryHook?: ((message: ITelemetryEvent) => void) | undefined
): Promise<
  ICounterfactualData | Record<string, unknown> | undefined | unknown
> {
  try {
    const result: ICounterfactualData | Record<string, unknown> | undefined =
      await requestLocalCounterfactuals?.(
        counterfactualsId,
        absoluteIndex,
        new AbortController().signal
      );
    telemetryHook?.({
      level: TelemetryLevels.Trace,
      type: TelemetryEventName.LocalCounterfactualsFetchSuccess
    });

    return result;
  } catch (error) {
    telemetryHook?.({
      context: error,
      level: TelemetryLevels.Error,
      type: TelemetryEventName.LocalCounterfactualsFetchError
    });
    return error;
  }
}
