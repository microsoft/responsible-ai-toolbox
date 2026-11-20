// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  describeCohortFunctionality,
  modelAssessmentDatasets
} from "@responsible-ai/e2e";

describe("Standards-mode categorical cohorts", () => {
  let initialCohorts: number;

  before(() => {
    cy.visit("/#/modelAssessment/adultCensusIncomeData/1-light/en/1");
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

  describeCohortFunctionality(
    modelAssessmentDatasets.CensusClassificationModelDebugging
  );

  describe("Persisted cohorts", () => {
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
