// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICounterfactualData } from "@responsible-ai/core-ui";

export async function getLocalExplanationsFromSDK(
  absoluteIndex: number,
  requestLocalExplanations?: (
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<Record<string, unknown> | ICounterfactualData>
): Promise<unknown> {
  const result: unknown = await requestLocalExplanations?.(
    absoluteIndex,
    new AbortController().signal
  );

  return result;
}
