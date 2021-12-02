// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function limitStringLength(
  str: string | undefined,
  length: number
): string | undefined {
  if ((str?.length || 0) > length) {
    return `${str?.slice(0, Math.max(0, length))}...`;
  }
  return str;
}
