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

    it.skip("should update x-axis value when 'Feature' dropdown is changed", () => {
      cy.get(Locators.ICEFeatureDropdown).click();
      cy.get(Locators.ICEFeatureDropdownOption).click();
      cy.get(Locators.ICEXAxisNewValue).should("contain", "workclass");
    });

    it.skip("Should have tooltip 'How to read this chart'", () => {
      cy.get(Locators.ICEToolTipButton).should("exist");
      cy.get(Locators.ICEToolTipButton).click();
      cy.get(Locators.ICECalloutTitle).should(
        "contain",
        localization.Interpret.WhatIfTab.icePlot
      );
      cy.get(Locators.ICECalloutBody).should(
        "contain",
        localization.Interpret.WhatIfTab.icePlotHelperText
      );
    });
  });
}
