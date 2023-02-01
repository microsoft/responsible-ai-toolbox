// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ILocalExplanations } from "@responsible-ai/core-ui";

export async function getLocalExplanationsFromSDK(
  absoluteIndex: number,
  requestLocalExplanations?: (
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<ILocalExplanations>
): Promise<unknown> {
  try {
    const result = await requestLocalExplanations?.(
      absoluteIndex,
      new AbortController().signal
    );
    return result;
  } catch (error) {
    return error;
  }
}
