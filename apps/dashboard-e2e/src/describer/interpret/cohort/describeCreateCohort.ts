// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IInterpretData } from "../IInterpretData";

export function describeCreateCohort(dataShape: IInterpretData): void {
  it("should have no filter by default", () => {
    cy.get('button:contains("New cohort")').click();
    cy.get('#cohortEditPanel span:contains("No filters added yet")').should(
      "exist"
    );
  });
  it("should able to add filter", () => {
    cy.get('button:contains("New cohort")').click();

    cy.get("#cohortEditPanel input:eq(0)").clear().type("CohortCreateE2E");
    cy.get('#cohortEditPanel [type="radio"]').first().check();
    cy.get('button:contains("Add filter")').click();

    cy.get('#cohortEditPanel span:contains("No filters added yet")').should(
      "not.exist"
    );
  });
  it("should able to add multiple filters", () => {
    cy.get('button:contains("New cohort")').click();

    cy.get("#cohortEditPanel input:eq(0)").clear().type("CohortCreateE2E");
    cy.get('#cohortEditPanel [type="radio"]').first().check();
    cy.get('button:contains("Add filter")').click();

    cy.get('#cohortEditPanel [type="radio"]').first().check();
    cy.get('button:contains("Add filter")').click();

    cy.get("#removeFilterBtn-1").should("exist");
  });
  it("should able to delete filter", () => {
    cy.get('button:contains("New cohort")').click();

    cy.get("#cohortEditPanel input:eq(0)").clear().type("CohortCreateE2E");
    cy.get('#cohortEditPanel [type="radio"]').first().check();
    cy.get('button:contains("Add filter")').click();
    cy.get("#removeFilterBtn-0").click();
    cy.get('#cohortEditPanel span:contains("No filters added yet")').should(
      "exist"
    );
  });
  it("should show error message with no cohort name", () => {
    cy.get('button:contains("New cohort")').click();

    cy.get("#cohortEditPanel input:eq(0)").clear();
    cy.get('#cohortEditPanel [type="radio"]').first().check();
    cy.get('button:contains("Add filter")').click();

    cy.get('#cohortEditPanel span:contains("Missing cohort name")').should(
      "exist"
    );
  });
  it("should not create cohort with no name", () => {
    cy.get('button:contains("New cohort")').click();

    cy.get("#cohortEditPanel input:eq(0)").clear();
    cy.get('#cohortEditPanel [type="radio"]').first().check();
    cy.get('button:contains("Add filter")').click();
    cy.get('button:contains("Save")').click();
    cy.get("#cohortEditPanel").should("exist");
  });
  it("should create New cohort", () => {
    cy.get('button:contains("New cohort")').click();

    cy.get("#cohortEditPanel input:eq(0)").clear().type("CohortCreateE2E");
    cy.get('#cohortEditPanel [type="radio"]').first().check();
    cy.get('button:contains("Add filter")').click();
    cy.get('button:contains("Save")').click();
    cy.get('span:contains("CohortCreateE2E")').should("exist");
  });
  if (dataShape.noDataset) {
    it("should not have options of dataset", () => {
      cy.get('button:contains("New cohort")').click();
      cy.get('#cohortEditPanel span:contains("Dataset")').should("not.exist");
    });
  }
}
