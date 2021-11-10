// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectRow } from "apps/widget-e2e/src/util/Table";
import { locators } from "../../Constants";

export function describeSubLineChart(): void {
  describe("Sub line chart", () => {
    before(() => {
      selectRow("Index", "4");

      cy.get(locators.ICEPlot).click();
    });
    after(() => {
      selectRow("Index", "4");
    });
    it("should have more than one point", () => {
      cy.get(locators.ICENoOfPoints).its("length").should("be.gte", 1);
    });
  });
}
