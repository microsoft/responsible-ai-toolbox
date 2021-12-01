// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "apps/widget-e2e/src/util/getSpan";
import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeWhatIfCreate(dataShape: IModelAssessmentData): void {
  describe.only("What if Create counterfactual", () => {
    before(() => {
      cy.get(Locators.WICDatapointDropbox).click();
      getSpan(
        dataShape.whatIfCounterfactualsData?.selectedDatapoint || "Index 5"
      ).click();
      cy.get(Locators.CreateWhatIfCounterfactualButton)
        .click()
        .get(Locators.WhatIfCounterfactualPanel)
        .should("exist");
    });
    after(() => {
      cy.get(Locators.WhatIfCloseButton).click();
    });
    it("should sort feature on clicking 'Sort feature columns by counterfactual feature importance'", () => {
      cy.get(Locators.WhatIfColumnHeaders)
        .eq(2)
        .contains(
          dataShape.whatIfCounterfactualsData?.columnHeaderBeforeSort || "age"
        );
      cy.get(Locators.WhatIfCreateCounterfactualSortButton).click();
      cy.get(Locators.WhatIfColumnHeaders)
        .eq(2)
        .contains(
          dataShape.whatIfCounterfactualsData?.columnHeaderAfterSort ||
            "capital-gain"
        );
      cy.get(Locators.WhatIfCreateCounterfactualSortButton).click();
    });

    it("should filter by included letters in search query", () => {
      cy.get(Locators.WhatIfSearchBar).type(
        dataShape.whatIfCounterfactualsData?.searchBarQuery || "occupation"
      );
      cy.get(Locators.WhatIfColumnHeaders)
        .eq(2)
        .contains(
          dataShape.whatIfCounterfactualsData?.searchBarQuery || "occupation"
        );
      cy.get(Locators.WhatIfSearchBarClearTextButton).click();
      cy.get(Locators.WhatIfColumnHeaders)
        .eq(2)
        .contains(
          dataShape.whatIfCounterfactualsData?.columnHeaderBeforeSort || "age"
        );
    });

    it("Should have 'Create your own counterfactual' section and it should be editable", () => {
      cy.get(Locators.CreateYourOwnCounterfactualInputField)
        .eq(2)
        .clear()
        .type(
          dataShape.whatIfCounterfactualsData
            ?.CreateYourOwnCounterfactualInputFieldUpdated || "25"
        );
      cy.get(Locators.CreateYourOwnCounterfactualInputField).eq(2).focus();
      cy.focused()
        .should("have.attr", "value")
        .and(
          "contain",
          dataShape.whatIfCounterfactualsData
            ?.CreateYourOwnCounterfactualInputFieldUpdated || "25"
        );
    });

    it("Should have what-if counterfactual name as 'Copy of row <index selected>' by default and should be editable", () => {
      cy.get(Locators.WhatIfNameLabel)
        .should("have.attr", "value")
        .and("contain", dataShape.whatIfCounterfactualsData?.WhatIfNameLabel);
      cy.get(Locators.WhatIfNameLabel).type(
        dataShape.whatIfCounterfactualsData?.WhatIfNameLabelUpdated ||
          "New Copy of row 5"
      );
      cy.get(Locators.WhatIfNameLabel)
        .should("have.attr", "value")
        .and(
          "contain",
          dataShape.whatIfCounterfactualsData?.WhatIfNameLabelUpdated
        );
    });
  });
}
