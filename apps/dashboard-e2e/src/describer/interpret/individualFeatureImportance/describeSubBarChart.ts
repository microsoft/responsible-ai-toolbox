// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BarChart } from "../../../../../util/BarChart";
import { ScatterChart } from "../../../../../util/ScatterChart";
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
      props.chart.clickNthPoint(0);
    });
    after(() => {
      props.chart.clickNthPoint(0);
    });
    it("should have right number of bars", () => {
      cy.get("#FeatureImportanceBar svg .plot .points .point path").should(
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
      cy.get(
        '#FeatureImportanceBar g[class^="cartesianlayer"] g[class^="xtick"]'
      )
        .its("length")
        .should("be", props.dataShape.featureNames.length);
    });
  });
}
