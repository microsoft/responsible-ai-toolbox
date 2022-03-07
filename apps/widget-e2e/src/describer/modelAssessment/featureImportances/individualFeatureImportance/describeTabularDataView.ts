// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../../util/getMenu";
import { selectRow } from "../../../../util/Table";
import { Locators } from "../../Constants";
import { IModelAssessmentData } from "../../IModelAssessmentData";
import { regExForNumbersWithBrackets } from "../../modelAssessmentDatasets";

// import { describeSubBarChart } from "./describeSubBarChart";
import { describeSubLineChart } from "./describeSubLineChart";

export function describeTabularDataView(dataShape: IModelAssessmentData): void {
  describe("Tabular data view", () => {
    before(() => {
      getMenu("Individual feature importance").click();
    });
    if (dataShape.featureImportanceData?.hasCorrectIncorrectDatapoints) {
      it("should have right number of correct prediction datapoints", () => {
        cy.get(Locators.IFIPredictionSpan)
          .first()
          .invoke("text")
          .should("match", regExForNumbersWithBrackets);
      });

      it("should have right number of incorrect prediction datapoints", () => {
        cy.get(Locators.IFIExpandCollapseButton).first().click(); // collapse correct predictions
        cy.get(Locators.IFIPredictionSpan)
          .eq(1)
          .invoke("text")
          .should("match", regExForNumbersWithBrackets);
      });
    }

    it("should be scrollable", () => {
      cy.get(Locators.IFIScrollableTable).should("exist");
    });

    describe("Table rows should be selectable", () => {
      it("should select none by default", () => {
        cy.get(Locators.IFITableRowSelected).should("not.exist");
      });
      it("should show message on sub chart", () => {
        const message =
          !dataShape.featureImportanceData?.noLocalImportance &&
          !dataShape.featureImportanceData?.noFeatureImportance
            ? "Select a point to see its local importance"
            : "Provide local feature importances to see how each feature impacts individual predictions.";
        cy.get("#subPlotContainer").should("contain.text", message);
      });
      it("should select the row", () => {
        selectRow("Index", dataShape.featureImportanceData?.rowToSelect || "4");
        cy.get(Locators.IFIDropdownSelectedOption).should(
          "contain.text",
          dataShape.featureImportanceData?.dropdownRowName
        );
        selectRow("Index", "4");
      });
    });

    // if (
    //   !dataShape.featureImportanceData?.noLocalImportance &&
    //   !dataShape.featureImportanceData?.noFeatureImportance
    // ) {
    //   describeSubBarChart(dataShape);
    // }
    if (!dataShape.featureImportanceData?.noPredict) {
      describeSubLineChart(dataShape);
    }
  });
}
