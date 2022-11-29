// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../../../util/getMenu";
import { selectRow } from "../../../../../util/Table";
import { Locators } from "../../Constants";
import {
  modelAssessmentDatasets,
  regExForNumbersWithBrackets
} from "../../datasets/modelAssessmentDatasets";
import { IModelAssessmentData } from "../../IModelAssessmentData";

// import { describeSubBarChart } from "./describeSubBarChart";
import { describeSubLineChart } from "./describeSubLineChart";

export function describeTabularDataView(
  dataShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasets
): void {
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

      it("should collapse 'Correct predictions' by default", () => {
        cy.get(Locators.IFICollapseButton).should("be.visible");
      });

      it("should have right number of incorrect prediction datapoints", () => {
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
            ? "Select a datapoint in the table above to view its local feature importances"
            : "Provide local feature importances to see how each feature impacts individual predictions.";
        cy.get("#subPlotContainer").should("contain.text", message);
      });
      it("should select the row", () => {
        if (dataShape.featureImportanceData?.hasCorrectIncorrectDatapoints) {
          cy.get(Locators.IFICollapseButton).eq(0).click(); // expand correct predictions
        }
        selectRow(
          "Index",
          dataShape.featureImportanceData?.rowToSelect || "4",
          Locators.IFIContainer
        );
        cy.get(Locators.IFIDropdownSelectedOption).should(
          "contain.text",
          dataShape.featureImportanceData?.dropdownRowName
        );
        selectRow("Index", "4", Locators.IFIContainer);
      });
    });

    // if (
    //   !dataShape.featureImportanceData?.noLocalImportance &&
    //   !dataShape.featureImportanceData?.noFeatureImportance
    // ) {
    //   describeSubBarChart(dataShape);
    // }
    if (!dataShape.featureImportanceData?.noPredict) {
      describeSubLineChart(dataShape, name);
    }
  });
}
