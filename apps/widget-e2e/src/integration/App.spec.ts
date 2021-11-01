// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

describe("widget", () => {
  it("should render", () => {
    const hosts = Cypress.env().hosts;
    cy.task("log", hosts);
    cy.visit(hosts[0].host);
    cy.get("#ModelAssessmentDashboard").should("exist");
    return;
  });
});
