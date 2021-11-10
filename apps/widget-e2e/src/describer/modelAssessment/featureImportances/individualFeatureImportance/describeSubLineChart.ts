// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function describeSubLineChart(): void {
  describe("Sub line chart", () => {
    before(() => {
      cy.get('div[class^="ms-List-page"] div[class^="ms-DetailsRow-check"]')
        .eq(1)
        .click();

      cy.get('#subPlotChoice label:contains("ICE")').click();
    });
    after(() => {
      cy.get('div[class^="ms-List-page"] div[class^="ms-DetailsRow-check"]')
        .eq(1)
        .click();
    });
    it("should have more than one point", () => {
      cy.get("#subPlotContainer svg g[class^='plot'] .points .point")
        .its("length")
        .should("be.gte", 1);
    });
  });
}
