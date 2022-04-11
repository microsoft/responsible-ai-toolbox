// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export function describeErrorAnalysisTreeMap(): void {
  describe("Tree Map", () => {
    it("should have clear selection button disabled", () => {
      cy.get(Locators.ErrorAnalysisHeader)
        .get(Locators.ClearSelectionButton)
        .should("exist")
        .should("be.disabled");
    });
  });
}
