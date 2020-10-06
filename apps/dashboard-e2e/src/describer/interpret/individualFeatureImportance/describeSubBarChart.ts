// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BarChart } from "../../../util/BarChart";
import { getMenu } from "../../../util/getMenu";
import { ScatterChart } from "../../../util/ScatterChart";
import { IInterpretData } from "../IInterpretData";

export function describeSubBarChart(dataShape: IInterpretData): void {
  const props = {
    chart: (undefined as unknown) as ScatterChart,
    dataShape,
    subBarChart: (undefined as unknown) as BarChart
  };
  describe("Sub bar chart", () => {
    beforeEach(() => {
      getMenu(
        "Individual Feature Importance & What-If",
        "#DashboardPivot"
      ).click();
      props.chart = new ScatterChart("#IndividualFeatureImportanceChart");
      props.chart.clickNthPoint(0);
    });
    it("should have right number of bars", () => {
      cy.get("svg .plot .points .point path")
        .its("length")
        .should("be", props.dataShape.featureNames.length);
    });
    it("should have y axis with matched value", () => {
      cy.get('#FeatureImportanceBar div[class^="rotatedVerticalBox-"]').should(
        "contain.text",
        "Feature Importance"
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
