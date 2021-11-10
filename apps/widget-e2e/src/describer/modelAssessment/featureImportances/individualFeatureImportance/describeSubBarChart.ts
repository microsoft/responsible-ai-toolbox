// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BarChart } from "../../../../util/BarChart";
import { ScatterChart } from "../../../../util/ScatterChart";
import { selectRow } from "../../../../util/Table";
import { Locators } from "../../Constants";
import { IModelAssessmentData } from "../../IModelAssessmentData";

export function describeSubBarChart(dataShape: IModelAssessmentData): void {
  const props = {
    chart: undefined as unknown as ScatterChart,
    dataShape,
    subBarChart: undefined as unknown as BarChart
  };
  describe("Sub bar chart", () => {
    before(() => {
      selectRow("Index", "4");
    });
    after(() => {
      selectRow("Index", "4");
    });
    it("should have right number of bars", () => {
      cy.get(Locators.IFINumberOfBars).should(
        "have.length",
        props.dataShape.featureNames?.length
      );
    });
    it("should have y axis with matched value", () => {
      cy.get(Locators.IFIYAxisValue).should(
        "contain.text",
        "Feature importance"
      );
    });
    it("should have right number of x axis labels", () => {
      cy.get(Locators.IFIXAxisValue)
        .its("length")
        .should("be", props.dataShape.featureNames?.length);
    });
  });
}
