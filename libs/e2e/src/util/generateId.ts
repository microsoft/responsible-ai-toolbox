// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function generateId(length?: number): string {
  const len = length === undefined ? 4 : length;
  // tslint:disable-next-line: insecure-random
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .slice(0, Math.max(0, len));
}
