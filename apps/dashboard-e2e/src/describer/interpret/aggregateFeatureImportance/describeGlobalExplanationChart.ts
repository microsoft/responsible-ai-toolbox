// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { toNumber } from "lodash";

import { Chart, IChartElement } from "../../../util/Chart";
import { getComboBoxValue, selectComboBox } from "../../../util/comboBox";
import { ScatterHighchart } from "../../../util/ScatterHighchart";
import { IInterpretData } from "../IInterpretData";

const topKLabelReg = /^Top (\d+) features by their importance$/;
function getTopKValue(): number {
  const exec = topKLabelReg.exec(cy.$$("#TopKSliderContainer label").text());
  if (!exec || !exec[1]) {
    throw new Error("Cannot find top k label");
  }
  return toNumber(exec[1]);
}

export function describeGlobalExplanationChart<
  TElement extends IChartElement
>(props: { chart: Chart<TElement>; dataShape: IInterpretData }): void {
  describe("Global explanation chart", () => {
    it("should have y axis label", () => {
      cy.get('#FeatureImportanceBar div[class*="rotatedVerticalBox"]').should(
        "contain.text",
        "Aggregate feature importance"
      );
    });
    it("should have x axis label", () => {
      const columns = props.dataShape.featureNames.slice(0, 4);
      for (const column of columns) {
        cy.get(`#FeatureImportanceBar svg g.highcharts-xaxis-labels`).should(
          "contain.text",
          column
        );
      }
    });
    it(`should have box elements`, () => {
      expect(props.chart.Elements.length).greaterThan(0);
    });
    if (!props.dataShape.noLocalImportance) {
      describe.skip("Chart Settings", () => {
        it("chart elements should match top K setting", () => {
          const topK = getTopKValue();
          expect(props.chart.VisibleElements).length(topK);
        });
        it("should increase top K setting", () => {
          const topK = getTopKValue();
          cy.get("#TopKSliderContainer .ms-Slider-slideBox")
            .focus()
            .type("{rightarrow}")
            .then(() => {
              expect(props.chart.VisibleElements).length(
                Math.min(topK + 1, props.dataShape.featureNames.length)
              );
            });
        });
      });

      if (!props.dataShape.noDataset) {
        const dependencePlotChart = new ScatterHighchart("#DependencePlot");
        describe("DependencePlot", () => {
          before(() => {
            selectComboBox("#DependencePlotFeatureSelection", 1);
          });
          it("should render", () => {
            expect(dependencePlotChart.Elements.length).greaterThan(0);
          });
          it("should have x axis match selected value", () => {
            cy.get('#DependencePlot div[class^="horizontalAxis-"]').should(
              "contain.text",
              getComboBoxValue("#DependencePlotFeatureSelection")
            );
          });
          it("should have y axis match selected value", () => {
            cy.get('#DependencePlot div[class^="rotatedVerticalBox-"]').should(
              "contain.text",
              getComboBoxValue("#DependencePlotFeatureSelection")
            );
          });
          it("should have y axis for feature importance", () => {
            cy.get('#DependencePlot div[class^="rotatedVerticalBox-"]').should(
              "contain.text",
              "Feature importance of"
            );
          });
        });
      }
    }
  });
}
