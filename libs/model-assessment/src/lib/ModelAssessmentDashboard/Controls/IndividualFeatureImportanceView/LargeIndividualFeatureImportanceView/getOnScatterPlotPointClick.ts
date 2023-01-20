// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export async function getLocalExplanationsFromSDK(
  absoluteIndex: number,
  requestLocalExplanations?: (
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<any>
): Promise<unknown> {
  const result: unknown = await requestLocalExplanations?.(
    absoluteIndex,
    new AbortController().signal
  );

  return result;
}
