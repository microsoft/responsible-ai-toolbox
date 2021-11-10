// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectRow } from "apps/widget-e2e/src/util/Table";
import { locators } from "../../Constants";
import { IModelAssessmentData } from "../../IModelAssessmentData";

import { describeSubBarChart } from "./describeSubBarChart";
import { describeSubLineChart } from "./describeSubLineChart";

export function describeDataPointChart(dataShape: IModelAssessmentData): void {
  describe("Individual datapoints chart", () => {
    it("should have right number of correct prediction datapoints", () => {
      cy.get(locators.IFIPredictionSpan)
        .first()
        .should(
          "contain.text",
          dataShape.featureImportanceData?.correctPredictionDatapoint
        );
    });

    it("should have right number of incorrect prediction datapoints", () => {
      cy.get(locators.IFIExpandCollapseButton).click();
      cy.get(locators.IFIPredictionSpan)
        .eq(1)
        .should(
          "contain.text",
          dataShape.featureImportanceData?.incorrectPredictionDatapoint
        );
    });

    describe("Table rows should be selectable", () => {
      it("should select none by default", () => {
        cy.get(locators.IFITableRowSelected).should("not.exist");
      });
      it("should show message on sub chart", () => {
        const message =
          !dataShape.featureImportanceData?.noLocalImportance &&
          !dataShape.featureImportanceData?.noFeatureImportance
            ? "Select a point to see its local importance"
            : "Provide local feature importances to see how each feature impacts individual predictions.";
        cy.get("#subPlotContainer").should("contain.text", message);
      });
      it("should select the first point", () => {
        selectRow("Index", "4");
        cy.get(locators.IFIDropdownSelectedOption).should(
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
