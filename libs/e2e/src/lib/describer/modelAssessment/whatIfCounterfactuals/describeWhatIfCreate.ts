// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "../../../../util/getSpan";
import { Locators } from "../Constants";
import { modelAssessmentDatasets } from "../datasets/modelAssessmentDatasets";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeWhatIfCreate(
  dataShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasets
): void {
  // AML do not need to execute below tests, as these options are not available for static view
  if (name) {
    describe("What if Create counterfactual", () => {
      before(() => {
        cy.get(Locators.WICDatapointDropbox).click();
        getSpan(
          dataShape.whatIfCounterfactualsData?.selectedDatapoint || "Index 1"
        ).click();
        cy.get(Locators.CreateWhatIfCounterfactualButton)
          .click()
          .get(Locators.WhatIfCounterfactualPanel)
          .should("exist");
      });
      after(() => {
        cy.get(Locators.WhatIfCloseButton).click();
      });

      it("should filter by included letters in search query", () => {
        cy.get(Locators.WhatIfSearchBar).type(
          dataShape.whatIfCounterfactualsData?.searchBarQuery || ""
        );
        cy.get(Locators.WhatIfColumnHeaders)
          .eq(2)
          .contains(dataShape.whatIfCounterfactualsData?.searchBarQuery || "");
        cy.get(Locators.WhatIfSearchBarClearTextButton).click();
        cy.get(Locators.WhatIfColumnHeaders).contains(
          dataShape.whatIfCounterfactualsData?.columnHeaderAfterSort || ""
        );
      });
      it("Should have 'Create your own counterfactual' section and it should be editable", () => {
        cy.get(Locators.CreateYourOwnCounterfactualInputField)
          .eq(2)
          .clear()
          .type(
            dataShape.whatIfCounterfactualsData
              ?.createYourOwnCounterfactualInputFieldUpdated || "25"
          );
        cy.get(Locators.CreateYourOwnCounterfactualInputField).eq(2).focus();
        cy.focused()
          .should("have.attr", "value")
          .and(
            "contain",
            dataShape.whatIfCounterfactualsData
              ?.createYourOwnCounterfactualInputFieldUpdated || "25"
          );
      });

      it("Should have 'Create your own counterfactual' section and should be able to input decimal point", () => {
        cy.get(Locators.CreateYourOwnCounterfactualInputField)
          .eq(3)
          .clear()
          .type(
            dataShape.whatIfCounterfactualsData
              ?.createYourOwnCounterfactualDecimalInput || "18.5"
          );
        cy.get(Locators.CreateYourOwnCounterfactualInputField).eq(3).focus();
        cy.focused()
          .should("have.attr", "value")
          .and(
            "contain",
            dataShape.whatIfCounterfactualsData
              ?.createYourOwnCounterfactualDecimalInput || "18.5"
          );
      });

      it("Should have 'Predicted value' section and it should not be editable", () => {
        cy.get(Locators.CreateYourOwnCounterfactualPredictedValueField).should(
          "exist"
        );
      });

      it("Should have what-if counterfactual name as 'Copy of row <index selected>' by default and should be editable", () => {
        cy.get(Locators.WhatIfNameLabel)
          .should("have.attr", "value")
          .and("contain", dataShape.whatIfCounterfactualsData?.whatIfNameLabel);
        cy.get(Locators.WhatIfNameLabel).type(
          dataShape.whatIfCounterfactualsData?.whatIfNameLabelUpdated ||
            "New Copy of row 1"
        );
        cy.get(Locators.WhatIfNameLabel)
          .should("have.attr", "value")
          .and(
            "contain",
            dataShape.whatIfCounterfactualsData?.whatIfNameLabelUpdated
          );
      });
    });
  }

  describe.skip("What-If save scenario", () => {
    before(() => {
      cy.get(Locators.WICDatapointDropbox).click();
      getSpan(
        dataShape.whatIfCounterfactualsData?.selectedDatapoint || "Index 1"
      )
        .scrollIntoView()
        .click({ force: true });
      cy.get(Locators.CreateWhatIfCounterfactualButton)
        .click({ force: true })
        .get(Locators.WhatIfCounterfactualPanel)
        .should("exist");
    });
    it("Should save as datapoint on clicking 'save as new datapoint'", () => {
      cy.get(Locators.WhatIfSetValueButton).eq(1).click({ force: true });
      cy.get(Locators.WhatIfSaveAsNewDatapointButton).click();
      cy.get(Locators.WhatIfSaveAsDataPoints).should(
        "contain",
        dataShape.whatIfCounterfactualsData?.whatIfNameLabel
      );

      // Should be able to delete datapoint created
      cy.get(Locators.WhatIfSaveAsDataPointsDeleteButton).click();
      cy.get(Locators.WhatIfSaveAsDataPoints).should("not.exist");
    });
  });

  describe.skip("What-If sort scenario", () => {
    it("should sort feature on clicking 'Sort feature columns by counterfactual feature importance'", () => {
      cy.get(Locators.WhatIfColumnHeaders)
        .eq(2)
        .contains(
          dataShape.whatIfCounterfactualsData?.columnHeaderBeforeSort || ""
        );
      cy.get(Locators.WhatIfCreateCounterfactualSortButton).click();
      cy.get(Locators.WhatIfColumnHeaders)
        .eq(2)
        .invoke("text")
        .then((text1) => {
          expect(text1).to.not.equal(
            dataShape.whatIfCounterfactualsData?.columnHeaderBeforeSort
          );
        });
      cy.get(Locators.WhatIfCreateCounterfactualSortButton).click();
    });
  });
}
