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
        cy.get(`${Locators.DECRotatedVerticalBox} button`).then(($btn) => {
          $btn.trigger("click");
        });
        cy.get(Locators.DECAxisPanel).should("exist");
        cy.get(Locators.CancelButton).then(($btn) => {
          $btn.trigger("click");
        });
      });
      it("should be able to hide settings", () => {
        cy.get(`${Locators.DECRotatedVerticalBox} button`).then(($btn) => {
          $btn.trigger("click");
        });
        cy.get(Locators.DECCloseButton).then(($btn) => {
          $btn.trigger("click");
        });
        cy.get(Locators.DECAxisPanel).should("not.exist");
      });
      it("should display right y-axis title", () => {
        cy.get(
          `${Locators.DECRotatedVerticalBox} span[class*="textContainer"]`
        ).contains(defaultYAxis);
      });

      it("should populate feature list passed in from SDK in flyout", () => {
        cy.get(`${Locators.DECRotatedVerticalBox} button`).then(($btn) => {
          $btn.trigger("click");
        });
        cy.get(Locators.AxisFeatureDropdown).then(($btn) => {
          $btn.trigger("click");
        });
        cy.get(Locators.AxisFeatureDropdownOption).should(
          "have.length",
          featureNames?.length
        );
        cy.get(Locators.DECCloseButton).then(($btn) => {
          $btn.trigger("click");
        });
      });
      if (!noY) {
        it("should change to different y-axis title", () => {
          cy.get(`${Locators.DECRotatedVerticalBox} button`).then(($btn) => {
            $btn.trigger("click");
          });

          cy.get(`${Locators.DECChoiceFieldGroup} label:eq(3)`)
            .invoke("text")
            .then((text1) => {
              cy.get(`#AxisConfigPanel label:contains(${text1})`)
                .trigger("mouseover")
                .click();
              cy.get(Locators.SelectButton).then(($btn) => {
                $btn.trigger("click");
              });
              cy.get(`${Locators.DECRotatedVerticalBox} button:eq(0)`).contains(
                text1
              );
            });
          cy.get(`${Locators.DECRotatedVerticalBox} button`)

            .then(($btn) => {
              $btn.trigger("click");
            })
            .get(`${Locators.DECChoiceFieldGroup} label:contains('Dataset')`)

            .then(($btn) => {
              $btn.trigger("click");
            });
          cy.get(Locators.SelectButton).then(($btn) => {
            $btn.trigger("click");
          });
        });
      }
    });
    describe("X Axis settings dialog", () => {
      it("should display settings dialog", () => {
        cy.get(`${Locators.DECHorizontalAxis} button`).then(($btn) => {
          $btn.trigger("click");
        });
        cy.get(Locators.DECAxisPanel).should("exist");
        cy.get(Locators.CancelButton).then(($btn) => {
          $btn.trigger("click");
        });
      });
      it("should be able to hide settings", () => {
        cy.get(`${Locators.DECHorizontalAxis} button`).then(($btn) => {
          $btn.trigger("click");
        });
        cy.get(Locators.DECCloseButton).then(($btn) => {
          $btn.trigger("click");
        });
        cy.get(Locators.DECAxisPanel).should("not.exist");
      });
      it("should display right x-axis title", () => {
        cy.get(
          `${Locators.DECHorizontalAxis} span[class*="textContainer"]`
        ).contains(defaultXAxis);
      });
      if (!noY) {
        it("should change to different x-axis title", () => {
          cy.get(`${Locators.DECHorizontalAxis} button`).then(($btn) => {
            $btn.trigger("click");
          });

          cy.get(`${Locators.DECChoiceFieldGroup} label:eq(3)`)
            .invoke("text")
            .then((text1) => {
              cy.get(`#AxisConfigPanel label:contains(${text1})`)
                .trigger("mouseover")
                .click();
              cy.get(Locators.SelectButton).then(($btn) => {
                $btn.trigger("click");
              });
              cy.get(`${Locators.DECHorizontalAxis} button:eq(0)`).contains(
                text1
              );
            });
          cy.get(`${Locators.DECHorizontalAxis} button`)

            .then(($btn) => {
              $btn.trigger("click");
            })
            .get(`${Locators.DECChoiceFieldGroup} label:contains('Index')`)

            .then(($btn) => {
              $btn.trigger("click");
            });
          cy.get(Locators.SelectButton).then(($btn) => {
            $btn.trigger("click");
          });
        });
      }
    });
    if (hasColorAxis) {
      describe("Color Axis settings dialog", () => {
        beforeEach(() => {
          cy.get("#DatasetExplorerChart button#SetColorButton").trigger(
            "click"
          );
        });
        it("should display settings dialog", () => {
          cy.get(Locators.DECAxisPanel).should("exist");
          cy.get(Locators.CancelButton).then(($btn) => {
            $btn.trigger("click");
          });
        });
        it("should be able to hide settings", () => {
          cy.get(Locators.DECCloseButton).then(($btn) => {
            $btn.trigger("click");
          });
          cy.get(Locators.DECAxisPanel).should("not.exist");
        });
      });
    }
  });
}
