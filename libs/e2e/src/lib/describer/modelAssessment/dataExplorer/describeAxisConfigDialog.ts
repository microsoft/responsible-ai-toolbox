// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export function describeAxisConfigDialog(
  defaultXAxis: string,
  defaultYAxis: string,
  noY: boolean,
  hasColorAxis: boolean,
  featureNames?: string[]
): void {
  describe("Axis settings dialog", () => {
    describe("Y Axis settings dialog", () => {
      it("should display settings dialog", () => {
        cy.get(`${Locators.DECRotatedVerticalBox} button`).click();
        cy.get(Locators.DECAxisPanel).should("exist");
        cy.get(Locators.CancelButton).click();
      });
      it("should be able to hide settings", () => {
        cy.get(`${Locators.DECRotatedVerticalBox} button`).click();
        cy.get(Locators.DECCloseButton).click();
        cy.get(Locators.DECAxisPanel).should("not.exist");
      });
      it("should display right y-axis title", () => {
        cy.get(
          `${Locators.DECRotatedVerticalBox} span[class*="textContainer"]`
        ).contains(defaultYAxis);
      });

      it("should populate feature list passed in from SDK in flyout", () => {
        cy.get(`${Locators.DECRotatedVerticalBox} button`).click();
        cy.get(Locators.AxisFeatureDropdown).click();
        cy.get(Locators.AxisFeatureDropdownOption).should(
          "have.length",
          featureNames?.length
        );
        cy.get(Locators.DECCloseButton).click();
      });
      if (!noY) {
        it("should change to different y-axis title", () => {
          cy.get(`${Locators.DECRotatedVerticalBox} button`).click();

          cy.get(`${Locators.DECChoiceFieldGroup} label:eq(3)`)
            .invoke("text")
            .then((text1) => {
              cy.get(`#AxisConfigPanel label:contains(${text1})`).click();
              cy.get(Locators.ApplyButton).click();
              cy.get(`${Locators.DECRotatedVerticalBox} button:eq(0)`).contains(
                text1
              );
            });
          cy.get(`${Locators.DECRotatedVerticalBox} button`)
            .click()
            .get(`${Locators.DECChoiceFieldGroup} label:contains('Dataset')`)
            .click();
          cy.get(Locators.ApplyButton).click();
        });
      }
    });
    describe("X Axis settings dialog", () => {
      it("should display settings dialog", () => {
        cy.get(`${Locators.DECHorizontalAxis} button`).click();
        cy.get(Locators.DECAxisPanel).should("exist");
        cy.get(Locators.CancelButton).click();
      });
      it("should be able to hide settings", () => {
        cy.get(`${Locators.DECHorizontalAxis} button`).click();
        cy.get(Locators.DECCloseButton).click();
        cy.get(Locators.DECAxisPanel).should("not.exist");
      });
      it("should display right x-axis title", () => {
        cy.get(
          `${Locators.DECHorizontalAxis} span[class*="textContainer"]`
        ).contains(defaultXAxis);
      });
      if (!noY) {
        it("should change to different x-axis title", () => {
          cy.get(`${Locators.DECHorizontalAxis} button`).click();

          cy.get(`${Locators.DECChoiceFieldGroup} label:eq(3)`)
            .invoke("text")
            .then((text1) => {
              cy.get(`#AxisConfigPanel label:contains(${text1})`).click();
              cy.get(Locators.ApplyButton).click();
              cy.get(`${Locators.DECHorizontalAxis} button:eq(0)`).contains(
                text1
              );
            });
          cy.get(`${Locators.DECHorizontalAxis} button`)
            .click()
            .get(`${Locators.DECChoiceFieldGroup} label:contains('Index')`)
            .click();
          cy.get(Locators.ApplyButton).click();
        });
      }
    });
    if (hasColorAxis) {
      describe("Color Axis settings dialog", () => {
        beforeEach(() => {
          cy.get("#DatasetExplorerChart button#SetColorButton").click();
        });
        it("should display settings dialog", () => {
          cy.get(Locators.DECAxisPanel).should("exist");
          cy.get(Locators.CancelButton).click();
        });
        it("should be able to hide settings", () => {
          cy.get(Locators.DECCloseButton).click();
          cy.get(Locators.DECAxisPanel).should("not.exist");
        });
      });
    }
  });
}
