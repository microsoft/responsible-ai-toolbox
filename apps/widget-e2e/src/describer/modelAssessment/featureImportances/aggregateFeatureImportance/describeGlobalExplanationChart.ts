// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { toNumber } from "lodash";

import { Chart, IChartElement } from "../../../../util/Chart";
import { getComboBoxValue, selectComboBox } from "../../../../util/comboBox";
import { ScatterHighchart } from "../../../../util/ScatterHighchart";
import { IModelAssessmentData } from "../../IModelAssessmentData";

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
>(props: { chart: Chart<TElement>; dataShape: IModelAssessmentData }): void {
  describe("Global explanation chart", () => {
    it("should have y axis label", () => {
      cy.get('#FeatureImportanceBar div[class*="rotatedVerticalBox"]').should(
        "contain.text",
        "Aggregate feature importance"
      );
    });
    it("should have x axis label", () => {
      const columns = props.dataShape.featureNames;
      if (columns) {
        for (let i = 0; i < 4; i++) {
          cy.get(`#FeatureImportanceBar svg g.xaxislayer-above g.xtick text`)
            .eq(i)
            .invoke("text")
            .then((text) => {
              const trimmedString = text.includes("...")
                ? text.slice(0, Math.max(0, text.indexOf("...")))
                : text;
              const stringInArray = columns.find((column) =>
                column.includes(trimmedString)
              );
              expect(stringInArray).not.equal(undefined);
            });
        }
      }
    });
    it(`should have ${props.dataShape.featureNames?.length} elements`, () => {
      expect(props.chart.Elements).length(props.dataShape.featureNames!.length);
    });
    if (!props.dataShape.featureImportanceData?.noLocalImportance) {
      describe("Chart Settings", () => {
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
                Math.min(topK + 1, props.dataShape.featureNames!.length)
              );
            });
        });
      });

      if (!props.dataShape.featureImportanceData?.noDataset) {
        const dependencePlotChart = new ScatterHighchart("#DependencePlot");
        describe.only("DependencePlot", () => {
          beforeEach(() => {
            selectComboBox("#DependencePlotFeatureSelection", 0);
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
