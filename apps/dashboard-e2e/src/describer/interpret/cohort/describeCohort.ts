// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { interpretDatasets } from "../interpretDatasets";

import { describeCreateCohort } from "./describeCreateCohort";

const testName = "Cohort";

export function describeCohort(name: keyof typeof interpretDatasets): void {
  const dataShape = interpretDatasets[name];
  describe(testName, () => {
    beforeEach(() => {
      cy.visit(`#/interpret/${name}/light/english/Version-2`);
    });
    it("should hide cohort edit panel by default", () => {
      cy.get("#cohortEditPanel").should("not.exist");
    });
    if (
      !dataShape.noDataset ||
      !dataShape.noLocalImportance ||
      !dataShape.noY
    ) {
      it("should cohort edit panel when click create", () => {
        cy.get('button:contains("New cohort")').click();
        cy.get("#cohortEditPanel").should("exist");
      });
      describeCreateCohort(dataShape);
    }
  });
}
