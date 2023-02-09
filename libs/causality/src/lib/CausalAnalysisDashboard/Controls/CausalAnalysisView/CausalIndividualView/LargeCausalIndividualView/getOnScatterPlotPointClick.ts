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
    return result;
  } catch (error) {
    telemetryHook?.({
      level: TelemetryLevels.Error,
      type: TelemetryEventName.LocalCausalEffectsFetchError
    });
    return error;
  }
}
