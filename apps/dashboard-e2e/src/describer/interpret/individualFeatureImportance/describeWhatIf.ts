// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { IInterpretData } from "../IInterpretData";

export function describeWhatIf(datasetShape: IInterpretData): void {
  describe("What if tab", () => {
    beforeEach(() => {
      getMenu("Individual feature importance", "#DashboardPivot").click();
    });
    if (!datasetShape.noY) {
      it("should delete selected data point", () => {
        // cy.get("#what-if-expand-btn").click();
        cy.get('button:contains("Save as new point")').click();
        cy.get("#IndividualFeatureContainer").should(
          "not.contain",
          "None created yet"
        );
        cy.get("#iterative-container button.ms-Button").last().click();
        cy.get("#IndividualFeatureContainer").should(
          "contain.text",
          "None created yet"
        );
      });
    }
  });
}
