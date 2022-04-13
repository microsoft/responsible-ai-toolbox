// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export function describeErrorAnalysisCohortInfo(): void {
  describe("Cohort info", () => {
    it("should have save cohort button disabled", () => {
      cy.get(Locators.ErrorAnalysisHeader)
        .get(Locators.SaveAsNewCohortButton)
        .should("exist")
        .should("be.disabled");
    });
  });
}
