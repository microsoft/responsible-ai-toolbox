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
      cy.get("#AxisConfigPanel div.ms-Panel-main").should("exist");
    });
    it("should be able to hide settings", () => {
      cy.get("#AxisConfigPanel button.ms-Panel-closeButton").click();
      cy.get("#AxisConfigPanel div.ms-Panel-main").should("not.exist");
    });
  });
  describe("X Axis settings dialog", () => {
    beforeEach(() => {
      cy.get(
        '#DatasetExplorerChart div[class*="horizontalAxis"] button'
      ).click();
    });
    it("should display settings dialog", () => {
      cy.get("#AxisConfigPanel div.ms-Panel-main").should("exist");
    });
    it("should be able to hide settings", () => {
      cy.get("#AxisConfigPanel button.ms-Panel-closeButton").click();
      cy.get("#AxisConfigPanel div.ms-Panel-main").should("not.exist");
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
        cy.get("#AxisConfigPanel div.ms-Panel-main").should("exist");
      });
      it("should be able to hide settings", () => {
        cy.get("#AxisConfigPanel button.ms-Panel-closeButton").click();
        cy.get("#AxisConfigPanel div.ms-Panel-main").should("not.exist");
      });
    });
  }
}
