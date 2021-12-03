// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "../../../util/getSpan";
import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeWhatIfCreate(dataShape: IModelAssessmentData): void {
  describe("What if Create counterfactual", () => {
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

    it("should set 'Create your own counterfactual' section with correct values by clicking on 'set value' link", () => {
      clickOnSetValueLink(
        dataShape.whatIfCounterfactualsData!.setValueData![0],
        dataShape.whatIfCounterfactualsData!.setValueData![1]
      );
      cy.get(
        `div[data-automation-key=${
          dataShape.whatIfCounterfactualsData!.setValueData![0]
        }] input`
      )
        .scrollIntoView()
        .should("have.attr", "value")
        .and("contain", dataShape.whatIfCounterfactualsData!.setValueData![1]);
    });
  });

  describe("What-If save scenario", () => {
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
    it("Should save as datapoint on clicking 'save as new datapoint'", () => {
      clickOnSetValueLink(
        dataShape.whatIfCounterfactualsData!.setValueData![0],
        dataShape.whatIfCounterfactualsData!.setValueData![1]
      );
      cy.get(Locators.WhatIfSaveAsNewDatapointButton).click();
      cy.get(Locators.WhatIfSaveAsDataPoints).should(
        "contain",
        dataShape.whatIfCounterfactualsData!.WhatIfNameLabel
      );

      // Should be able to delete datapoint created
      cy.get(Locators.WhatIfSaveAsDataPointsDeleteButton).click();
      cy.get(Locators.WhatIfSaveAsDataPoints).should("not.exist");
    });
  });
}

function clickOnSetValueLink(
  columnName: string,
  columnValue: string,
  srPrefix?: string
): void {
  const selectorPrefix = srPrefix ? `${srPrefix}` : "";
  const columnsHeaderColumn = `${selectorPrefix} [data-automationid='ColumnsHeaderColumn']`;
  cy.get(columnsHeaderColumn)
    .contains(columnName)
    .parents(columnsHeaderColumn)
    .invoke("attr", "data-item-key")
    .then((columnIndex) => {
      cy.get(`${selectorPrefix} [data-automation-key='${columnIndex}']`)
        .contains(columnValue)
        .parents(`${selectorPrefix} div[data-automationid='DetailsRowCell']`)
        .siblings(`${selectorPrefix} div[data-automationid='DetailsRowCell']`)
        .contains("Set Value")
        .click({ force: true });
    });
}
