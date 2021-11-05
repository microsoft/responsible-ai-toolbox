// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getValue(selector: string): string {
  return cy.$$(selector).val() as string;
}
