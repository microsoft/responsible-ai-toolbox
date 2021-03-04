// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { getText } from "../../../util/getText";
import { getValue } from "../../../util/getValue";
import { setValue } from "../../../util/setValue";
import { IInterpretData } from "../IInterpretData";

export function describeWhatIf(datasetShape: IInterpretData): void {
  describe("What if tab", () => {
    beforeEach(() => {
      getMenu("Individual feature importance", "#DashboardPivot").click();
    });
    it("should have no datapoint selected by default", () => {
      cy.get("#IndividualFeatureContainer").should(
        "contain.text",
        "None created yet"
      );
    });
    if (
      !datasetShape.noY &&
      !datasetShape.noPredict &&
      !datasetShape.errorMessage
    ) {
      it("should update when text field change", () => {
        const selector = datasetShape.isClassification
          ? "#WhatIfNewProbability"
          : "#WhatIfNewPredictedValue";
        const predict = getText(selector);
        const fieldSelector = "#WhatIfFeatureTextField";
        setValue(fieldSelector, "1");
        cy.get(selector).should("not.have.text", predict);
      });
      it("should update when combo box change", () => {
        const selector = datasetShape.isClassification
          ? "#WhatIfNewProbability"
          : "#WhatIfNewPredictedValue";
        const predict = getText(`${selector}:first`);
        const fieldSelector = "#WhatIfFeatureComboBox";
        const comboBoxValue = getText(fieldSelector);
        if (comboBoxValue) {
          setValue(fieldSelector, "1");
          cy.get(selector).should("not.have.text", predict);
        }
      });
      it("should update when combo box select new value", () => {
        const selector = datasetShape.isClassification
          ? "#WhatIfNewProbability"
          : "#WhatIfNewPredictedValue";
        const predict = getText(`${selector}:first`);
        const fieldSelector = "#WhatIfFeatureComboBox-input";
        const comboBoxValue = getValue(fieldSelector);
        if (comboBoxValue) {
          cy.get(fieldSelector)
            .siblings("button")
            .click()
            .get(
              `#WhatIfFeatureComboBox-list button:not(:contains("${comboBoxValue}"))`
            )
            .click();
          cy.get(selector).should("not.have.text", predict);
        }
      });
      it("should save data point from dropdown option", () => {
        cy.get("#indexSelector").click();
        cy.get('button:contains("Row 1")').last().click();
        cy.get("#whatIfNameLabel").should("have.value", "Copy of row 1");

        cy.get('button:contains("Save as new point")').click();
        cy.get("#IndividualFeatureContainer").should(
          "not.contain",
          "None created yet"
        );
      });
    }
  });
}
