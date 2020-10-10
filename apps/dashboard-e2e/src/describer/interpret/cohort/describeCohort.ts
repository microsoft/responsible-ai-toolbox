// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IInterpretData } from "../IInterpretData";

import { describeCreateCohort } from "./describeCreateCohort";

const testName = "Cohort";

export function describeCohort(dataShape: IInterpretData): void {
  describe(testName, () => {
    it("show hide cohort edit panel by default", () => {
      cy.get("#cohortEditPanel").should("not.exist");
    });
    if (!dataShape.noCohort) {
      it("show cohort edit panel when click create", () => {
        cy.get('button:contains("New Cohort")').click();
        cy.get("#cohortEditPanel").should("exist");
      });
      describeCreateCohort();
    }
  });
}
