// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from '../../util/getSpan';

export function getToModelComparisonPageWithDefaults(): void {
  getSpan("Get started").click();
  cy.get('button:contains("Next")').click();
  cy.get('button:contains("Next")').click();
  cy.get('button:contains("Next")').click();
}
