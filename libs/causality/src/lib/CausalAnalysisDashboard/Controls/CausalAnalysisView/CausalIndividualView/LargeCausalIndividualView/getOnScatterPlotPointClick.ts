// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICausalAnalysisData } from "@responsible-ai/core-ui";

export async function getLocalCausalFromSDK(
  causalId: string,
  absoluteIndex: number,
  requestLocalCausalEffects?: (
    causalId: string,
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<ICausalAnalysisData>
): Promise<unknown> {
  try {
    const result = await requestLocalCausalEffects?.(
      causalId,
      absoluteIndex,
      new AbortController().signal
    );
    return result;
  } catch (error) {
    return error;
  }
}
