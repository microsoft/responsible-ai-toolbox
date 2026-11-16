// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getText } from "../../../util/getText";
import { getValue } from "../../../util/getValue";
import { setValue } from "../../../util/setValue";
import { IInterpretData } from "../IInterpretData";

export function describeWhatIf(datasetShape: IInterpretData): void {
  describe("What if tab", () => {
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
        checkPredictionUpdate(datasetShape, () => {
          setValue("#WhatIfFeatureTextField", "1");
        });
      });
      it("should update when combo box change", () => {
        const fieldSelector = "#WhatIfFeatureComboBox";
        const comboBoxValue = getText(fieldSelector);
        if (comboBoxValue) {
          checkPredictionUpdate(datasetShape, () => {
            setValue(fieldSelector, "1");
          });
        }
      });
      it("should update when combo box select new value", () => {
        const fieldSelector = "#WhatIfFeatureComboBox-input";
        const comboBoxValue = getValue(fieldSelector);
        if (comboBoxValue) {
          checkPredictionUpdate(datasetShape, () => {
            cy.get(fieldSelector)
              .siblings("button")
              .click()
              .get(
                `#WhatIfFeatureComboBox-list button:not(:contains("${comboBoxValue}")):first`
              )
              .click();
          });
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

    function checkPredictionUpdate(
      datasetShape: IInterpretData,
      updateFeature: () => void
    ): void {
      const selector = datasetShape.isClassification
        ? "#WhatIfNewProbability"
        : "#WhatIfNewPredictedValue";
      cy.get(selector)
        .should("be.visible")
        .invoke("text")
        .then((previousPrediction) => {
          // The demo model uses random predictions, rounded to three decimal places.
          const prediction = previousPrediction === "0.25" ? 0.75 : 0.25;
          cy.window().then((window) => {
            cy.stub(window.Math, "random").returns(prediction);
          });
          updateFeature();
          cy.get(selector).should("have.text", prediction.toString());
        });
    }
  });
}
