// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ScatterChart } from "../../../../../util/ScatterChart";
import { IInterpretData } from "../IInterpretData";

import { describeSubBarChart } from "./describeSubBarChart";
import { describeSubLineChart } from "./describeSubLineChart";

export function describeDataPointChart(dataShape: IInterpretData): void {
  describe("Individual datapoints chart", () => {
    const props = {
      chart: undefined as unknown as ScatterChart,
      dataShape
    };
    beforeEach(() => {
      props.chart = new ScatterChart("#IndividualFeatureImportanceChart");
    });
    it("should render right number of points", () => {
      expect(props.chart.Elements.length).equals(dataShape.datapoint);
    });

    describe("Scatter chart clickable", () => {
      it("should select none by default", () => {
        cy.get(
          '#IndividualFeatureContainer div[class^="legendAndText"] div[class^="clickTarget"]'
        ).should("not.exist");
      });
      it("should show message on sub chart", () => {
        const message =
          !dataShape.noLocalImportance && !dataShape.noFeatureImportance
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

    if (!dataShape.noLocalImportance && !dataShape.noFeatureImportance) {
      describeSubBarChart(dataShape);
    }
    if (!dataShape.noPredict) {
      describeSubLineChart(dataShape);
    }
  });
}
