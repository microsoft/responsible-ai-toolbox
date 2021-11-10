// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModelAssessmentData } from "../../IModelAssessmentData";

import { describeSubBarChart } from "./describeSubBarChart";
import { describeSubLineChart } from "./describeSubLineChart";

export function describeDataPointChart(dataShape: IModelAssessmentData): void {
  describe("Individual datapoints chart", () => {
    it("should have right number of correct prediction datapoints", () => {
      cy.get('span[class^="headerCount"]')
        .first()
        .should(
          "contain.text",
          dataShape.featureImportanceData?.correctPredictionDatapoint
        );
    });

    it("should have right number of incorrect prediction datapoints", () => {
      cy.get("[aria-label='expand collapse group']").click();
      cy.get('span[class^="headerCount"]')
        .eq(1)
        .should(
          "contain.text",
          dataShape.featureImportanceData?.incorrectPredictionDatapoint
        );
    });

    describe("Table rows should be selectable", () => {
      it("should select none by default", () => {
        cy.get(
          'div[class^="ms-List-page"] div[class^="ms-DetailsRow"] div[class^="ms-Check is-checked"]'
        ).should("not.exist");
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
        cy.get('div[class^="ms-List-page"] div[class^="ms-DetailsRow-check"]')
          .eq(1)
          .click();
        cy.get("div[class^='featureImportanceChartAndLegend'] ").should(
          "contain.text",
          dataShape.featureImportanceData?.dropdownRowName
        );
        cy.get('div[class^="ms-List-page"] div[class^="ms-DetailsRow-check"]')
          .eq(1)
          .click();
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
