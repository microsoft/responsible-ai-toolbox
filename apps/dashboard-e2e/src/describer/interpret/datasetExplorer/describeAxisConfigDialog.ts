// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function describeAxisConfigDialog(
  defaultXAxis: string,
  defaultYAxis: string,
  noY: boolean,
  hasColorAxis: boolean
): void {
  describe("Axis settings dialog", () => {
    describe("Y Axis settings dialog", () => {
      it("should display settings dialog", () => {
        cy.get(
          '#DatasetExplorerChart div[class*="rotatedVerticalBox"] button'
        ).click();
        cy.get("#AxisConfigPanel div.ms-Panel-main").should("exist");
      });
      it("should be able to hide settings", () => {
        cy.get(
          '#DatasetExplorerChart div[class*="rotatedVerticalBox"] button'
        ).click();
        cy.get("#AxisConfigPanel button.ms-Panel-closeButton").click();
        cy.get("#AxisConfigPanel div.ms-Panel-main").should("not.exist");
      });
      it("should display right y-axis title", () => {
        cy.get(
          '#DatasetExplorerChart div[class*="rotatedVerticalBox"] span[class*="textContainer"]'
        ).contains(defaultYAxis);
      });
      if (!noY) {
        it("should change to different y-axis title", () => {
          cy.get(
            '#DatasetExplorerChart div[class*="rotatedVerticalBox"] button'
          ).click();

          cy.get(
            "#AxisConfigPanel div[class*='ms-ChoiceFieldGroup'] label:eq(3)"
          )
            .invoke("text")
            .then((text1) => {
              cy.get(`#AxisConfigPanel label:contains(${text1})`).click();
              cy.get("#AxisConfigPanel")
                .find("button")
                .contains("Select")
                .click();
              cy.get(
                '#DatasetExplorerChart div[class*="rotatedVerticalBox"] button:eq(0)'
              ).contains(text1);
            });
        });
      }
    });
    describe("X Axis settings dialog", () => {
      it("should display settings dialog", () => {
        cy.get(
          '#DatasetExplorerChart div[class*="horizontalAxis"] button'
        ).click();
        cy.get("#AxisConfigPanel div.ms-Panel-main").should("exist");
      });
      it("should be able to hide settings", () => {
        cy.get(
          '#DatasetExplorerChart div[class*="horizontalAxis"] button'
        ).click();
        cy.get("#AxisConfigPanel button.ms-Panel-closeButton").click();
        cy.get("#AxisConfigPanel div.ms-Panel-main").should("not.exist");
      });
      it("should display right x-axis title", () => {
        cy.get(
          '#DatasetExplorerChart div[class*="horizontalAxis"] span[class*="textContainer"]'
        ).contains(defaultXAxis);
      });
      if (!noY) {
        it("should change to different x-axis title", () => {
          cy.get(
            '#DatasetExplorerChart div[class*="horizontalAxis"] button'
          ).click();

          cy.get(
            "#AxisConfigPanel div[class*='ms-ChoiceFieldGroup'] label:eq(3)"
          )
            .invoke("text")
            .then((text1) => {
              cy.get(`#AxisConfigPanel label:contains(${text1})`).click();
              cy.get("#AxisConfigPanel")
                .find("button")
                .contains("Select")
                .click();
              cy.get(
                '#DatasetExplorerChart div[class*="horizontalAxis"] button:eq(0)'
              ).contains(text1);
            });
        });
      }
    });
    if (hasColorAxis) {
      describe("Color Axis settings dialog", () => {
        beforeEach(() => {
          cy.get("#DatasetExplorerChart button#SetColorButton").click();
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
  });
}
