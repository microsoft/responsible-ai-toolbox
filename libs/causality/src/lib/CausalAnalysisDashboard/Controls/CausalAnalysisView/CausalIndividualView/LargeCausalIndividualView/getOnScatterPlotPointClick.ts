// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICausalAnalysisData,
  ITelemetryEvent,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";

export async function getLocalCausalFromSDK(
  causalId: string,
  absoluteIndex: number,
  requestLocalCausalEffects?: (
    causalId: string,
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<ICausalAnalysisData>,
  telemetryHook?: ((message: ITelemetryEvent) => void) | undefined
): Promise<unknown> {
  try {
    const result = await requestLocalCausalEffects?.(
      causalId,
      absoluteIndex,
      new AbortController().signal
    );
    telemetryHook?.({
      level: TelemetryLevels.Trace,
      type: TelemetryEventName.LocalCausalEffectsFetchSuccess
    });

    return result;
  } catch (error) {
    telemetryHook?.({
      context: error,
      level: TelemetryLevels.Error,
      type: TelemetryEventName.LocalCausalEffectsFetchError
    });
    return error;
  }
}
