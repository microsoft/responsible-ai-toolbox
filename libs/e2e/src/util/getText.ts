// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getText(selector: string): string {
  return cy.$$(selector).text();
}
