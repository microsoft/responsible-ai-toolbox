// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { locators } from "../../Constants";

export function describeSubLineChart(): void {
  describe("Sub line chart", () => {
    before(() => {
      cy.get(locators.IFITableRows).eq(1).click();

      cy.get(locators.ICEPlot).click();
    });
    after(() => {
      cy.get(locators.IFITableRows).eq(1).click();
    });
    it("should have more than one point", () => {
      cy.get(locators.ICENoOfPoints).its("length").should("be.gte", 1);
    });
  });
}
