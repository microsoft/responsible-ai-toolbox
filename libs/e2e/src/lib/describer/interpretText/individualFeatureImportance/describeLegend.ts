// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export function describeLegend(): void {
  describe("Legend", () => {
    it("should exist", () => {
      cy.get(Locators.TextFeatureLegend).should("exist");
    });
    it("should have header", () => {
      cy.get(Locators.TextFeatureLegend).should(
        "contain.text",
        "TEXT FEATURE LEGEND"
      );
    });
    it("should have positive feature importance text", () => {
      cy.get(Locators.TextFeatureLegend).should(
        "contain.text",
        "POSITIVE FEATURE IMPORTANCE"
      );
    });
    it("should have positive feature importance text", () => {
      cy.get(Locators.TextFeatureLegend).should(
        "contain.text",
        "NEGATIVE FEATURE IMPORTANCE"
      );
    });
  });
}
