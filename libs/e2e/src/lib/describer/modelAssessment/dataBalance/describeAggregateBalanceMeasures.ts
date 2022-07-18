// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeAggregateBalanceMeasures(
  dataShape: IModelAssessmentData
): void {
  describe("Aggregate balance measures", () => {
    if (!dataShape.dataBalanceData?.aggregateBalanceMeasuresComputed) {
      it("Should not render aggregate balance measures", () => {
        cy.get(Locators.AggregateBalanceMeasures).should("not.exist");
      });
      return;
    }

    it("Should have a header with clickable info button", () => {
      cy.get(Locators.AggregateBalanceMeasuresHeader).contains(
        "Aggregate balance measures"
      );
      cy.get(`${Locators.AggregateBalanceMeasuresHeader} button`).should(
        "exist"
      );
    });

    it("Should have a table with 3 cols (name, value, desc) and 3 rows (each measure)", () => {
      cy.get(Locators.AggregateBalanceMeasuresTable).should("exist");
      cy.get(Locators.AggregateBalanceMeasuresTableColumns).should(
        "have.length",
        3
      );
      cy.get(Locators.AggregateBalanceMeasuresTableRows).should(
        "have.length",
        3
      );
    });
  });
}
