// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function describeAxisConfigDialog(): void {
  describe("Axis settings dialog", () => {
    describe("Y Axis settings dialog", () => {
      it("should display settings dialog", () => {
        cy.get(
          '#OverallMetricChart div[class*="rotatedVerticalBox"] button'
        ).click();
        cy.get("#AxisConfigPanel div.ms-Panel-main").should("exist");
      });
      it("should be able to hide settings", () => {
        cy.get("#AxisConfigPanel button.ms-Panel-closeButton").click();
        cy.get("#AxisConfigPanel div.ms-Panel-main").should("not.exist");
      });
      it("should change to different y-axis title", () => {
        cy.get(
          '#OverallMetricChart div[class*="rotatedVerticalBox"] button'
        ).click();

        cy.get("#AxisConfigPanel div[class*='ms-ChoiceFieldGroup'] label:eq(1)")
          .invoke("text")
          .then((text1) => {
            cy.get(`#AxisConfigPanel label:contains(${text1})`).click();
            cy.get("#AxisConfigPanel").find("button").contains("Apply").click();
            cy.get(
              '#OverallMetricChart div[class*="rotatedVerticalBox"] button:eq(0)'
            ).contains(text1);
          });
      });
    });
    describe("X Axis settings dialog", () => {
      it("should display settings dialog", () => {
        cy.get(
          '#OverallMetricChart div[class*="horizontalAxis"] button'
        ).click();
        cy.get("#AxisConfigPanel div.ms-Panel-main").should("exist");
      });
      it("should be able to hide settings", () => {
        cy.get("#AxisConfigPanel button.ms-Panel-closeButton").click();
        cy.get("#AxisConfigPanel div.ms-Panel-main").should("not.exist");
      });
      it("should change to different x-axis title", () => {
        cy.get(
          '#OverallMetricChart div[class*="horizontalAxis"] button'
        ).click();

        cy.get("#AxisConfigPanel div[class*='ms-ChoiceFieldGroup'] label:eq(1)")
          .invoke("text")
          .then((text1) => {
            cy.get(`#AxisConfigPanel label:contains(${text1})`).click();
            cy.get("#AxisConfigPanel").find("button").contains("Apply").click();
            cy.get(
              '#OverallMetricChart div[class*="horizontalAxis"] button:eq(0)'
            ).contains(text1);
          });
      });
    });
  });
}
