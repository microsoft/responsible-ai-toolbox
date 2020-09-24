// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { toNumber } from "lodash";

import { Chart, IChartElement } from "../../../util/Chart";
import { getComboBoxValue, selectComboBox } from "../../../util/comboBox";
import { ScatterChart } from "../../../util/ScatterChart";
import { IInterpretData } from "../IInterpretData";

function getTopKValue(): number {
  return toNumber(cy.$$("#TopKSetting input").val());
}

export function describeGlobalExplanationChart<
  TElement extends IChartElement
>(props: { chart: Chart<TElement>; dataShape: IInterpretData }): void {
  describe("Global explanation chart", () => {
    it("should have y axis label", () => {
      cy.get('#FeatureImportanceBar div[class*="rotatedVerticalBox"]').should(
        "contain.text",
        "Aggregate Feature Importance"
      );
    });
    it("should have x axis label", () => {
      const columns = props.dataShape.featureNames.slice(0, 4);
      for (const [i, column] of columns.entries()) {
        cy.get(
          `#FeatureImportanceBar svg g.xaxislayer-above g.xtick:nth-child(${
            i + 1
          }) text`
        ).should("contain.text", column);
      }
    });
    it(`should have ${props.dataShape.featureNames.length} elements`, () => {
      expect(props.chart.Elements).length(props.dataShape.featureNames.length);
    });
    if (!props.dataShape.noLocalImportance) {
      describe("Chart Settings", () => {
        beforeEach(() => {
          cy.get("#GlobalExplanationSettingsButton").click();
        });
        it("should display settings", () => {
          cy.get("#GlobalExplanationSettingsCallout").should("exist");
        });
        it("should be able to hide settings", () => {
          cy.get("#GlobalExplanationSettingsButton").click();
          cy.get("#GlobalExplanationSettingsCallout").should("not.exist");
        });
        it("chart elements should match top K setting", () => {
          const topK = getTopKValue();
          expect(props.chart.VisibleElements).length(topK);
        });
        it("should increase top K setting", () => {
          const topK = getTopKValue();
          cy.get("#TopKSetting input")
            .focus()
            .type("{uparrow}")
            .then(() => {
              expect(props.chart.VisibleElements).length(
                Math.min(topK + 1, props.dataShape.featureNames.length)
              );
            });
        });
      });

      if (!props.dataShape.noDataset) {
        const dependencePlotChart = new ScatterChart("#DependencePlot");
        describe("DependencePlot", () => {
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
