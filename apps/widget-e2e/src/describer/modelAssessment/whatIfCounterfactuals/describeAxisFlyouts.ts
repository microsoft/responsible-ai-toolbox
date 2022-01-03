// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeAxisFlyouts(dataShape: IModelAssessmentData): void {
  describe("What if Axis Flyouts", () => {
    describe("Y Axis functionalities", () => {
      it("should be able cancel the flyout", () => {
        cy.get(Locators.WhatIfScatterChartYAxis)
          .click()
          .get(Locators.WhatIfAxisPanel)
          .should("exist");
        cy.get(Locators.WhatIfScatterChartFlyoutCancel).click();
        cy.get(Locators.WhatIfAxisPanel).should("not.exist");
      });
      it("should have dropdown with feature list", () => {
        cy.get(Locators.WhatIfScatterChartYAxis).click();
        cy.get(Locators.AxisFeatureDropdown).click();
        cy.get(Locators.AxisFeatureDropdownOption).should(
          "have.length",
          dataShape.featureNames?.length
        );
        cy.get(Locators.WhatIfScatterChartFlyoutCancel).click();
      });
      it("should be able to select different feature", () => {
        cy.get(Locators.WhatIfScatterChartYAxis).click();
        cy.get(Locators.WhatIfAxisFeatureDropdownCurrentOption).should(
          "attr",
          "value",
          "age"
        );
        cy.get(Locators.AxisFeatureDropdown).click();
        cy.get(Locators.WhatIfYAxisFeatureDropdownOccupationOption).click();
        cy.get(Locators.WhatIfScatterChartFlyoutSelect).click();
        cy.get(Locators.WhatIfScatterChartYAxisLabelUpdated).should("exist");
      });

      it("should be able to select axis value", () => {
        cy.get(Locators.WhatIfScatterChartYAxis).click();
        cy.get(Locators.WhatIfYAxisAxisValueNewValue).click();
        cy.get(Locators.WhatIfScatterChartFlyoutSelect).click();
        cy.get(Locators.WhatIfScatterChartYAxisLabelUpdated2).should("exist");
      });
    });

    describe("X Axis functionalities", () => {
      it("should be able cancel the flyout", () => {
        cy.get(Locators.WhatIfScatterChartXAxis)
          .click()
          .get(Locators.WhatIfAxisPanel)
          .should("exist");
        cy.get(Locators.WhatIfScatterChartFlyoutCancel).click();
        cy.get(Locators.WhatIfAxisPanel).should("not.exist");
      });
      it("should have dropdown with class", () => {
        cy.get(Locators.WhatIfScatterChartXAxis).click();
        cy.get(Locators.AxisFeatureDropdown).click();
        cy.get(Locators.AxisFeatureDropdownOption).should("have.length", 2);
        cy.get(Locators.WhatIfScatterChartFlyoutCancel).click();
      });
      it("should be able to select different class", () => {
        cy.get(Locators.WhatIfScatterChartXAxis).click();
        cy.get(Locators.WhatIfAxisFeatureDropdownCurrentOption).should(
          "attr",
          "value",
          "Probability : <=50K"
        );
        cy.get(Locators.AxisFeatureDropdown).click();
        cy.get(Locators.WhatIfXAxisFeatureDropdownOccupationOption).click();
        cy.get(Locators.WhatIfScatterChartFlyoutSelect).click();
        cy.get(Locators.WhatIfScatterChartXAxisLabelUpdated).should("exist");
      });

      it("should be able to select axis value", () => {
        cy.get(Locators.WhatIfScatterChartXAxis).click();
        cy.get(Locators.WhatIfXAxisAxisValueNewValue).click();
        cy.get(Locators.WhatIfScatterChartFlyoutSelect).click();
        cy.get(Locators.WhatIfScatterChartXAxisLabelUpdated2).should("exist");
      });
    });
  });
}
