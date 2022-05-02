// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function setValue(selector: string, value: string): void {
  cy.get(selector).type(value).type("{enter}");
}
