// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { describeCohortFunctionality } from "@responsible-ai/e2e";

for (const dataset of ["adultCensusIncomeData", "wineData"]) {
  describe(`Standards-mode categorical cohorts: ${dataset}`, () => {
    let initialCohorts: number;

    before(() => {
      cy.visit(`/#/modelAssessment/${dataset}/1-light/en/1`, {
        onBeforeLoad(win) {
          // Static cohorts do not need training progress moving and dismissing menus.
          cy.stub(win, "Worker").returns({
            addEventListener: cy.stub(),
            postMessage: cy.stub()
          });
        },
        // A distinct query reloads the document instead of only changing its hash.
        qs: { cohortFixture: dataset }
      });
      cy.document().its("compatMode").should("equal", "CSS1Compat");
      cy.get("#dataAnalysisPivot .ms-Pivot-link").eq(1).click();
      cy.get("#cohortSettings").click();
      cy.get("#CohortSettingsPanel button:contains('Edit')")
        .its("length")
        .then((count) => {
          initialCohorts = count;
        });
      cy.get("#CohortSettingsPanel i[data-icon-name='Cancel']").click();
      cy.get("#CohortSettingsPanel").should("not.exist");
    });

    describeCohortFunctionality({
      checkDupCohort: true,
      cohortDefaultName: "All data",
      datasetExplorerData: {
        cohortDatasetNewValue: "40"
      }
    });

    describe("Persisted cohorts", () => {
      if (dataset === "wineData") {
        it("preserves all rows in the prebuilt class cohorts", () => {
          cy.get("#cohortSettings").click();
          cy.contains("#CohortSettingsPanel [role='row']", "All data")
            .contains(/^\d+ datapoints$/)
            .invoke("text")
            .then((allDataSize) => {
              for (const name of ["Cohort Predicted Y", "Cohort True Y"]) {
                cy.contains("#CohortSettingsPanel [role='row']", name).should(
                  "contain",
                  allDataSize
                );
              }
            });
          cy.get("#CohortSettingsPanel i[data-icon-name='Cancel']").click();
        });
      }

      it("retains all three cohorts created by the shared sequence", () => {
        cy.get("#cohortSettings").click();
        cy.get("#CohortSettingsPanel button:contains('Edit')").should(
          "have.length",
          initialCohorts + 3
        );
        cy.get("#CohortSettingsPanel i[data-icon-name='Cancel']").click();
      });
    });
  });
}
