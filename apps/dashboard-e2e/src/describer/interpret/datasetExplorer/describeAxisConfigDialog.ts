// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function describeAxisConfigDialog(hasColorAxis: boolean): void {
  describe("Y Axis settings dialog", () => {
    beforeEach(() => {
      cy.get(
        '#DatasetExplorerChart div[class*="rotatedVerticalBox"] button'
      ).click();
    });
    it("should display settings dialog", () => {
      cy.get('#XYColorConfigDialog div[class*="ms-Callout-container"]').should(
        "exist"
      );
    });
    it("should be able to hide settings", () => {
      cy.get(
        '#DatasetExplorerChart div[class*="rotatedVerticalBox"] button'
      ).click();
      cy.get('#XYColorConfigDialog div[class*="ms-Callout-container"]').should(
        "not.exist"
      );
    });
  });
  describe("X Axis settings dialog", () => {
    beforeEach(() => {
      cy.get(
        '#DatasetExplorerChart div[class*="horizontalAxis"] button'
      ).click();
    });
    it("should display settings dialog", () => {
      cy.get('#XYColorConfigDialog div[class*="ms-Callout-container"]').should(
        "exist"
      );
    });
    it("should be able to hide settings", () => {
      cy.get(
        '#DatasetExplorerChart div[class*="horizontalAxis"] button'
      ).click();
      cy.get('#XYColorConfigDialog div[class*="ms-Callout-container"]').should(
        "not.exist"
      );
    });
  });
  if (hasColorAxis) {
    describe("Color Axis settings dialog", () => {
      beforeEach(() => {
        cy.get(
          '#DatasetExplorerChart div[class*="legendAndText"] button'
        ).click();
      });
      it("should display settings dialog", () => {
        cy.get(
          '#XYColorConfigDialog div[class*="ms-Callout-container"]'
        ).should("exist");
      });
      it("should be able to hide settings", () => {
        cy.get(
          '#DatasetExplorerChart div[class*="legendAndText"] button'
        ).click();
        cy.get(
          '#XYColorConfigDialog div[class*="ms-Callout-container"]'
        ).should("not.exist");
      });
    });
  }
}
