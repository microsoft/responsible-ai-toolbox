// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectRow } from "../../../../util/Table";
import { Locators } from "../../Constants";

export function describeSubLineChart(): void {
  describe("Sub line chart", () => {
    before(() => {
      selectRow("Index", "4");

      cy.get(Locators.ICEPlot).click();
    });
    after(() => {
      selectRow("Index", "4");
    });
    it("should have more than one point", () => {
      cy.get(Locators.ICENoOfPoints).its("length").should("be.gte", 1);
    });
  });
}
