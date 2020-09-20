// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getGreeting(): Cypress.Chainable<JQuery<HTMLHeadingElement>> {
  return cy.get("h1");
}

export function getLink(
  href: string
): Cypress.Chainable<JQuery<HTMLAnchorElement>> {
  return cy.get(`a[href$="#${href}"]`);
}

export function selectDataset(name: string): void {
  cy.get("#datasetSelector").select(name);
}

export function selectVersion(version: number): void {
  cy.get("#versionSelector").select(`Version ${version}`);
}
