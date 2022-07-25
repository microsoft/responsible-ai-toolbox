// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeAggregateBalanceMeasures(
  dataShape: IModelAssessmentData
): void {
  describe("Aggregate balance measures", () => {
    if (!dataShape.dataBalanceData?.aggregateBalanceMeasuresComputed) {
      it("should render no measures computed message", () => {
        cy.get(
          `${Locators.AggregateBalanceMeasures} #MissingParameterPlaceHolder`
        ).contains(
          "Aggregate balance measures were not computed. To compute them, please ensure that: (1) the task type is 'classification', (2) the list of categorical features is valid and non-empty, and (3) no errors are thrown when computing insights."
        );
      });
      return;
    }

    it("should have a header with clickable info button", () => {
      cy.get(Locators.AggregateBalanceMeasuresHeader).contains(
        "Aggregate balance measures"
      );
      cy.get(`${Locators.AggregateBalanceMeasuresHeader} button`).should(
        "exist"
      );
    });

    it("should have a table with 3 cols (name, value, desc) and 3 rows (each measure)", () => {
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
