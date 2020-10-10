// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function describeCreateCohort(): void {
  it("show have no filter by default", () => {
    cy.get('button:contains("New Cohort")').click();
    cy.get('#cohortEditPanel span:contains("No filters added yet")').should(
      "exist"
    );
  });
  it("show able to add filter", () => {
    cy.get('button:contains("New Cohort")').click();

    cy.get("#cohortEditPanel input:eq(0)").type("CohortCreateE2E");
    cy.get('#cohortEditPanel [type="radio"]').first().check();
    cy.get('button:contains("Add Filter")').click();

    cy.get('#cohortEditPanel span:contains("No filters added yet")').should(
      "not.exist"
    );
  });
  it("show able to delete filter", () => {
    cy.get('button:contains("New Cohort")').click();

    cy.get("#cohortEditPanel input:eq(0)").type("CohortCreateE2E");
    cy.get('#cohortEditPanel [type="radio"]').first().check();
    cy.get('button:contains("Add Filter")').click();
    cy.get("#removeFilterBtn-0").click();
    cy.get('#cohortEditPanel span:contains("No filters added yet")').should(
      "exist"
    );
  });
  it("show create new cohort", () => {
    cy.get('button:contains("New Cohort")').click();

    cy.get("#cohortEditPanel input:eq(0)").type("CohortCreateE2E");
    cy.get('#cohortEditPanel [type="radio"]').first().check();
    cy.get('button:contains("Add Filter")').click();
    cy.get('button:contains("Save")').click();
    cy.get('span:contains("CohortCreateE2E")').should("exist");
  });
}
