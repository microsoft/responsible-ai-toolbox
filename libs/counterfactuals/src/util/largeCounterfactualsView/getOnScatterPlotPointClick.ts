// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICounterfactualData } from "@responsible-ai/core-ui";

export async function getLocalCounterfactualsFromSDK(
  absoluteIndex: number,
  counterfactualsId: string,
  requestLocalCounterfactuals?: (
    counterfactualsId: string,
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<Record<string, unknown> | ICounterfactualData>
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

    return result;
  } catch (e) {
    return e;
  }
}
