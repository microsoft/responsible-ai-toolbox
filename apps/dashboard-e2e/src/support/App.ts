export function getGreeting(): Cypress.Chainable<JQuery<HTMLHeadingElement>> {
  return cy.get("h1");
}

export function getLink(
  href: string
): Cypress.Chainable<JQuery<HTMLAnchorElement>> {
  return cy.get(`a[href$="#${href}"]`);
}

export function getMenu(
  text: string,
  container = ""
): Cypress.Chainable<JQuery<HTMLButtonElement>> {
  return cy.get(`${container} button:contains("${text}")`);
}

export function getSpan(
  text: string
): Cypress.Chainable<JQuery<HTMLSpanElement>> {
  return cy.get("span").contains(text);
}

export function selectDataset(name: string): void {
  cy.get("#datasetSelector").select(name);
}

export function selectVersion(version: number): void {
  cy.get("#versionSelector").select(`Version ${version}`);
}
