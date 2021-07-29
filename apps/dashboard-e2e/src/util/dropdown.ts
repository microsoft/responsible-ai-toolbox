// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "./getSpan";

export function selectDropdown(selector: string, item: string | number): void {
  cy.get(`${selector}`).click();
  getSpan(item.toString()).click();
}
