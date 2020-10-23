// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function limitStringLength(
  str: string | undefined,
  length: number
): string | undefined {
  console.log(str?.length, length);
  if ((str?.length || 0) > length) {
    return str?.substr(0, length) + "...";
  }
  return str;
}
