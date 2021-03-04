// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function setText(selector: string, value: string): void {
  cy.$$(selector).text(value);
}
