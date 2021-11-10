// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BarChart } from "../../../../util/BarChart";
import { ScatterChart } from "../../../../util/ScatterChart";
import { locators } from "../../Constants";
import { IModelAssessmentData } from "../../IModelAssessmentData";

export function describeSubBarChart(dataShape: IModelAssessmentData): void {
  const props = {
    chart: undefined as unknown as ScatterChart,
    dataShape,
    subBarChart: undefined as unknown as BarChart
  };
  describe("Sub bar chart", () => {
    before(() => {
      cy.get(locators.IFITableRows).eq(1).click();
    });
    after(() => {
      cy.get(locators.IFITableRows).eq(1).click();
    });
    it("should have right number of bars", () => {
      cy.get(locators.IFINumberOfBars).should(
        "have.length",
        props.dataShape.featureNames?.length
      );
    });
    it("should have y axis with matched value", () => {
      cy.get(locators.IFIYAxisValue).should(
        "contain.text",
        "Feature importance"
      );
    });
    it("should have right number of x axis labels", () => {
      cy.get(locators.IFIXAxisValue)
        .its("length")
        .should("be", props.dataShape.featureNames?.length);
    });
  });
}
