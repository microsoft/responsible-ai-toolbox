// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BarChart } from "../../../../util/BarChart";
import { ScatterChart } from "../../../../util/ScatterChart";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeSubBarChart(dataShape: IModelAssessmentData): void {
  const props = {
    chart: undefined as unknown as ScatterChart,
    dataShape,
    subBarChart: undefined as unknown as BarChart
  };
  describe("Sub bar chart", () => {
    before(() => {
      props.chart = new ScatterChart("#IndividualFeatureImportanceChart");
      props.chart.clickNthPoint(14);
    });
    after(() => {
      props.chart.clickNthPoint(14);
    });
    it("should have right number of bars", () => {
      cy.get(
        "#WhatIfFeatureImportanceBar g.highcharts-xaxis-labels text"
      ).should("have.length", props.dataShape.featureNames?.length);
    });
    it.skip("should have y axis with matched value", () => {
      cy.get(
        '#WhatIfFeatureImportanceBar div[class^="rotatedVerticalBox-"]'
      ).should("contain.text", "Feature importance");
    });
    it("should have right number of x axis labels", () => {
      cy.get(
        "#WhatIfFeatureImportanceBar g.highcharts-xaxis-labels text"
      ).should("have.length", props.dataShape.featureNames?.length);
    });
  });
}
