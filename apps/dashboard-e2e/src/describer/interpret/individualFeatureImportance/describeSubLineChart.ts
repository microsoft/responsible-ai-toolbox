// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ScatterChart } from "../../../util/ScatterChart";
import { IInterpretData } from "../IInterpretData";

export function describeSubLineChart(dataShape: IInterpretData): void {
  const props = {
    chart: undefined as unknown as ScatterChart,
    dataShape
  };
  describe("Sub line chart", () => {
    before(() => {
      props.chart = new ScatterChart("#IndividualFeatureImportanceChart");
      props.chart.clickNthPoint(1);

      cy.get('#subPlotChoice label:contains("ICE")').click();
    });
    after(() => {
      props.chart.clickNthPoint(1);
    });
    it("should have more than one point", () => {
      cy.get("#subPlotContainer svg g[class^='highcharts-series-group'] path")
        .its("length")
        .should("be.gte", 1);
    });
  });
}
