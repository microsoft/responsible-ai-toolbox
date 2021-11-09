// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ScatterChart } from "../../../../util/ScatterChart";
import { IModelAssessmentData } from "../../IModelAssessmentData";

export function describeSubLineChart(dataShape: IModelAssessmentData): void {
  const props = {
    chart: undefined as unknown as ScatterChart,
    dataShape
  };
  describe("Sub line chart", () => {
    before(() => {
      props.chart = new ScatterChart("#IndividualFeatureImportanceChart");
      props.chart.clickNthPoint(0);

      cy.get('#subPlotChoice label:contains("ICE")').click();
    });
    after(() => {
      props.chart.clickNthPoint(0);
    });
    it("should have more than one point", () => {
      cy.get("#subPlotContainer svg g[class^='plot'] .points .point")
        .its("length")
        .should("be.gte", 1);
    });
  });
}
