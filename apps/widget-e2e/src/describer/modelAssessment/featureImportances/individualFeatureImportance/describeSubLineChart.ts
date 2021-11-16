// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import { selectRow } from "../../../../util/Table";
import { Locators } from "../../Constants";

export function describeSubLineChart(): void {
  describe("Sub line chart", () => {
    before(() => {
      selectRow("Index", "4");

      cy.get(Locators.ICEPlot).click();
    });
    after(() => {
      selectRow("Index", "4");
    });
    it("should have more than one point", () => {
      cy.get(Locators.ICENoOfPoints).its("length").should("be.gte", 1);
    });

    it("should update x-axis value when 'Feature' dropdown is changed", () => {
      // selectDropdown(Locators.ICEFeatureDropdown, "workclass");
      // cy.get(`${Locators.ICEFeatureDropdown}`)
      //   .click()
      //   .trigger("mouseover")
      //   .get("button:contains('workclass')")
      //   .click();
      // cy.get(
      //   "div[class^='featureImportanceLegend'] div[class^='ms-ComboBox-container'] button:contains('workclass')"
      // )
      //   .click()
      //   .should("have.attr", "aria-expanded", "true")
      //   .type("workclass");
      // getSpan("workclass").scrollIntoView().click();
      // cy.get(Locators.ICEFeatureDropdown).click().trigger("mouseover");
      // cy.get(Locators.ICEFeatureDropdownOption).click();
      // cy.get(Locators.ICEFeatureDropdown).click();
      // cy.get(Locators.ICEFeatureDropdownOption).click();
      cy.get(Locators.ICEFeatureDropdown).click();
      if (typeof "workclass" === "string") {
        cy.get(".ms-Callout")
          .should("be.visible")
          .contains("workclass")
          .scrollIntoView()
          .click({ force: true });
      }
      cy.get(Locators.ICEXAxisNewValue).should("contain", "workclass");
    });

    it("Should have tooltip 'How to read this chart'", () => {
      cy.get(Locators.ICEToolTipButton).should("exist");
      cy.get(Locators.ICEToolTipButton).click({ force: true });
      cy.get(Locators.ICECalloutTitle)
        .should("exist")
        .scrollIntoView()
        .should("contain", localization.Interpret.WhatIfTab.icePlot);
      cy.get(Locators.ICECalloutBody)
        .should("exist")
        .scrollIntoView()
        .should("contain", localization.Interpret.WhatIfTab.icePlotHelperText);
    });
  });
}
