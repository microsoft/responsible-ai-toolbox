// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BarChart } from "../../../../util/BarChart";
import { ScatterChart } from "../../../../util/ScatterChart";
import { assertRowSelected, selectRow } from "../../../../util/Table";
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

    it("should update x axis labels on changing top features by their importance number", () => {
      cy.get(Locators.IFITopFeaturesText).should(
        "have.text",
        dataShape.featureImportanceData?.topFeaturesText
      );
      cy.get(Locators.IFITopFeaturesValue).should(
        "have.attr",
        "aria-valuenow",
        dataShape.featureImportanceData?.topFeaturesCurrentValue
      );
      const currentValue = 4;
      const newValue = 6;
      const increment = 1;
      const steps = (newValue - currentValue) / increment;
      const arrows = "{rightarrow}".repeat(steps);

      cy.get(Locators.IFITopFeaturesValue)
        .should(
          "have.attr",
          "aria-valuenow",
          dataShape.featureImportanceData?.topFeaturesCurrentValue
        )
        .type(arrows);

      cy.get(Locators.IFITopFeaturesValue).should(
        "have.attr",
        "aria-valuenow",
        11
      );
    });

    it("should be able to select different 'datapoint'", () => {
      selectRow("Index", "7");
      assertRowSelected("Index", "7");
    });

    it("Should have Sort by absolute values toggle button", () => {
      cy.get(Locators.IFIAbsoluteValuesToggleButton)
        .click({ force: true })
        .should("have.class", "is-checked");
    });
  });
}
