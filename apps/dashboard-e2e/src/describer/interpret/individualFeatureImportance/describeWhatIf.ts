// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";

export function describeWhatIf(): void {
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
    it("should save data point", () => {
      cy.get("#what-if-expand-btn").click();
      cy.get('button:contains("Save as new point")').click();
      cy.get("#IndividualFeatureContainer").should(
        "not.contain",
        "None created yet"
      );
    });
    it("should delete selected data point", () => {
      cy.get("#what-if-expand-btn").click();
      cy.get('button:contains("Save as new point")').click();
      cy.get("#IndividualFeatureContainer").should(
        "not.contain",
        "None created yet"
      );
      cy.get("#iterative-container button.ms-Button").click({ multiple: true });
      cy.get("#IndividualFeatureContainer").should(
        "contain.text",
        "None created yet"
      );
    });
  });
}
