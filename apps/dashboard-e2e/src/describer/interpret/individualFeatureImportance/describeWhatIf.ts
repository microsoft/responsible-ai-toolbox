// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { IInterpretData } from "../IInterpretData";

export function describeWhatIf(datasetShape: IInterpretData): void {
  describe("What if tab", () => {
    beforeEach(() => {
      getMenu("Individual feature importance", "#DashboardPivot").click();
    });
    it("should have no datapoint selected by default", () => {
      cy.get("#IndividualFeatureContainer").should(
        "contain.text",
        "None created yet"
      );
    });
    if (
      !datasetShape.noY &&
      !datasetShape.noPredict &&
      !datasetShape.errorMessage
    ) {
      it("should save data point from dropdown option", () => {
        cy.get("#what-if-expand-btn").click();
        cy.get("#indexSelector").click();
        cy.get('button:contains("Row 1")').last().click();
        cy.get("#whatIfNameLabel").should("have.value", "Copy of row 1");

        cy.get('button:contains("Save as new point")').click();
        cy.get("#IndividualFeatureContainer").should(
          "not.contain",
          "None created yet"
        );
      });
    }
  });
}
