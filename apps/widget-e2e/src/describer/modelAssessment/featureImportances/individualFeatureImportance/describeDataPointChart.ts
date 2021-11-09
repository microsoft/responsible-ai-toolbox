// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTableRowCount } from "apps/widget-e2e/src/util/Table";
import { ScatterChart } from "../../../../util/ScatterChart";
import { IModelAssessmentData } from "../../IModelAssessmentData";

import { describeSubBarChart } from "./describeSubBarChart";
import { describeSubLineChart } from "./describeSubLineChart";

export function describeDataPointChart(dataShape: IModelAssessmentData): void {
  describe("Individual datapoints chart", () => {
    const props = {
      chart: undefined as unknown as ScatterChart,
      dataShape
    };
    beforeEach(() => {
      props.chart = new ScatterChart("#IndividualFeatureImportanceChart");
    });
    it("should render right number of points", () => {
      expect(getTableRowCount()).equals(
        dataShape.featureImportanceData?.datapoint
      );
    });

    describe("Scatter chart clickable", () => {
      it("should select none by default", () => {
        cy.get(
          '#IndividualFeatureContainer div[class^="legendAndText"] div[class^="clickTarget"]'
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
        props.chart.clickNthPoint(0);
        cy.get(
          '#IndividualFeatureContainer  div[class^="legendAndText"] div[class^="clickTarget"]'
        ).should("contain.text", "Row");
        cy.get("#noPointSelectedInfo").should("not.exist");
        props.chart.clickNthPoint(0);
      });
    });

    if (
      !dataShape.featureImportanceData?.noLocalImportance &&
      !dataShape.featureImportanceData?.noFeatureImportance
    ) {
      describeSubBarChart(dataShape);
    }
    if (!dataShape.featureImportanceData?.noPredict) {
      describeSubLineChart(dataShape);
    }
  });
}
