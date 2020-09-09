export function getSpan(
  text: string
): Cypress.Chainable<JQuery<HTMLSpanElement>> {
  return cy.get("span").contains(text);
}
