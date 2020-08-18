export function getGreeting(): Cypress.Chainable<JQuery<HTMLHeadingElement>> {
  return cy.get("h1");
}
export function getLink(
  href: string
): Cypress.Chainable<JQuery<HTMLAnchorElement>> {
  return cy.get(`a[href$="#${href}"]`);
}
