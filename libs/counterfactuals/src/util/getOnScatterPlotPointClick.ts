// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export async function getLocalCounterfactualsFromSDK(
  absoluteIndex: number,
  counterfactualsId?: string,
  requestLocalCounterfactuals?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>
): Promise<any> {
  const input = [counterfactualsId, absoluteIndex];
  const result: any = await requestLocalCounterfactuals?.(
    input,
    new AbortController().signal
  );

  return result;
}
