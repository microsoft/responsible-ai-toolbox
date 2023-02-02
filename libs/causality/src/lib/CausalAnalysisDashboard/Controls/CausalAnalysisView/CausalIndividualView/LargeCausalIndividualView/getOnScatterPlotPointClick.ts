// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export async function getLocalExplanationsFromSDK(
  causalId: string,
  absoluteIndex: number,
  requestLocalCausalEffects?: (
    causalId: string,
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<any>
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
