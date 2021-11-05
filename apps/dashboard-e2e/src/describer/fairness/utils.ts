// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "../../util/getSpan";

export function getToModelComparisonPageWithDefaults(): Cypress.Chainable<
  JQuery<HTMLElement>
> {
  return getSpan("Get started")
    .click()
    .get('button:contains("Next")')
    .click()
    .get('button:contains("Next")')
    .click()
    .get('button:contains("Next")')
    .click();
}
