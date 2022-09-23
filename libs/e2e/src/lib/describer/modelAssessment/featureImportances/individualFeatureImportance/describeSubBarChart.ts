// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { toNumber } from "lodash";

import { BarChart } from "../../../../../util/BarChart";
import { ScatterChart } from "../../../../../util/ScatterChart";
import { assertRowSelected, selectRow } from "../../../../../util/Table";
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
      cy.get(Locators.IFIXAxisValue).should(
        "have.length",
        props.dataShape.featureNames?.length
      );
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

      props.subBarChart = new BarChart("#FeatureImportanceBar");
      const topK = getTopKValue();
      cy.get(
        "#subPlotContainer div[class^='featureImportanceControls'] .ms-Slider-slideBox"
      )
        .focus()
        .type("{rightarrow}")
        .then(() => {
          expect(props.subBarChart.VisibleElements).length(
            Math.min(topK + 1, props.dataShape.featureNames?.length || 0)
          );
        });
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

const topKLabelReg = /^Top (\d+) features by their importance$/;
function getTopKValue(): number {
  const exec = topKLabelReg.exec(
    cy.$$("div[class^='featureImportanceControls'] span").text()
  );
  if (!exec || !exec[1]) {
    throw new Error("Cannot find top k label");
  }
  return toNumber(exec[1]);
}
