// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectRow } from "../../../../util/Table";
import { Locators } from "../../Constants";
import { IModelAssessmentData } from "../../IModelAssessmentData";

import { describeSubBarChart } from "./describeSubBarChart";
import { describeSubLineChart } from "./describeSubLineChart";

export function describeTabularDataView(dataShape: IModelAssessmentData): void {
  describe("Tabular data view", () => {
    it("should have right number of correct prediction datapoints", () => {
      cy.get(Locators.IFIPredictionSpan)
        .first()
        .should(
          "contain.text",
          dataShape.featureImportanceData?.correctPredictionDatapoint
        );
    });

    it("should have right number of incorrect prediction datapoints", () => {
      cy.get(Locators.IFIExpandCollapseButton).click();
      cy.get(Locators.IFIPredictionSpan)
        .eq(1)
        .should(
          "contain.text",
          dataShape.featureImportanceData?.incorrectPredictionDatapoint
        );
    });

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
        selectRow("Index", "4");
        cy.get(Locators.IFIDropdownSelectedOption).should(
          "contain.text",
          dataShape.featureImportanceData?.dropdownRowName
        );
        selectRow("Index", "4");
      });
    });

    if (
      !dataShape.featureImportanceData?.noLocalImportance &&
      !dataShape.featureImportanceData?.noFeatureImportance
    ) {
      describeSubBarChart(dataShape);
    }
    if (!dataShape.featureImportanceData?.noPredict) {
      describeSubLineChart();
    }
  });
}
