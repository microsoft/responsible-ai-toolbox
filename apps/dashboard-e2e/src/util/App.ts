// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getGreeting(): ReturnType<Cypress.cy["get"]> {
  return cy.get("h1");
}

export function getLink(href: string): ReturnType<Cypress.cy["get"]> {
  return cy.get(`a[href$="#${href}"]`);
}

export function selectDataset(name: string): void {
  cy.get("#datasetSelector").select(name);
}

export function selectVersion(version: number): void {
  cy.get("#versionSelector").select(`Version ${version}`);
}
