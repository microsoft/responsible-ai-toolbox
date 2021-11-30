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
        cy.get(Locators.WhatIfScatterChartYAxisFlyoutCancel).click();
        cy.get(Locators.WhatIfAxisPanel).should("not.exist");
      });
      it("should have dropdown with feature list", () => {
        cy.get(Locators.WhatIfScatterChartYAxis).click();
        cy.get(Locators.WhatIfYAxisFeatureDropdown).click();
        cy.get(Locators.WhatIfYAxisFeatureDropdownOption).should(
          "have.length",
          dataShape.featureNames?.length
        );
        cy.get(Locators.WhatIfScatterChartYAxisFlyoutCancel).click();
      });
      it("should be able to select different feature", () => {
        cy.get(Locators.WhatIfScatterChartYAxis).click();
        cy.get(Locators.WhatIfYAxisFeatureDropdownCurrentOption).should(
          "attr",
          "value",
          "age"
        );
        cy.get(Locators.WhatIfYAxisFeatureDropdown).click();
        cy.get(Locators.WhatIfYAxisFeatureDropdownOccupationOption).click();
        cy.get(Locators.WhatIfScatterChartYAxisFlyoutSelect).click();
        cy.get(Locators.WhatIfScatterChartYAxisLabelUpdated).should("exist");
      });

      it("should be able to select axis value", () => {
        cy.get(Locators.WhatIfScatterChartYAxis).click();
        cy.get(Locators.WhatIfYAxisAxisValueNewValue).click();
        cy.get(Locators.WhatIfScatterChartYAxisFlyoutSelect).click();
        cy.get(Locators.WhatIfScatterChartYAxisLabelUpdated2).should("exist");
      });
    });
  });
}
