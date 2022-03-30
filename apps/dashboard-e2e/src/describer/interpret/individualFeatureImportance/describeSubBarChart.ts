// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BarChart } from "../../../util/BarChart";
import { ScatterChart } from "../../../util/ScatterChart";
import { IInterpretData } from "../IInterpretData";

export function describeSubBarChart(dataShape: IInterpretData): void {
  const props = {
    chart: undefined as unknown as ScatterChart,
    dataShape,
    subBarChart: undefined as unknown as BarChart
  };
  describe("Sub bar chart", () => {
    before(() => {
      props.chart = new ScatterChart("#IndividualFeatureImportanceChart");
      props.chart.clickNthPoint(1);
    });
    after(() => {
      props.chart.clickNthPoint(1);
    });
    it("should have right number of bars", () => {
      cy.get("#FeatureImportanceBar svg g.highcharts-series-group rect").should(
        "have.length",
        props.dataShape.featureNames.length
      );
    });
    it("should have y axis with matched value", () => {
      cy.get('#FeatureImportanceBar div[class^="rotatedVerticalBox-"]').should(
        "contain.text",
        "Feature importance"
      );
    });
    it("should have right number of x axis labels", () => {
      cy.get("#FeatureImportanceBar g.highcharts-xaxis-labels text")
        .its("length")
        .should("be", props.dataShape.featureNames.length);
    });
  });
}
