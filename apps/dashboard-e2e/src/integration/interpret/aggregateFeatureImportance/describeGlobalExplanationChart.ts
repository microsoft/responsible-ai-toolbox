// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { toNumber } from "lodash";
import { Chart, IChartElement } from "../../../support/Chart";
import { IDataSetShape } from "../IDataSetShape";

function getTopKValue(): number {
  return toNumber(cy.$$("#TopKSetting input").val());
}

export function describeGlobalExplanationChart<
  TElement extends IChartElement
>(props: { chart: Chart<TElement>; dataShape: IDataSetShape }): void {
  describe("Global explanation chart", () => {
    it("should have y axis label", () => {
      cy.get('#FeatureImportanceBar div[class*="rotatedVerticalBox"]').should(
        "contain.text",
        "Aggregate Feature Importance"
      );
    });
    it("should have x axis label", () => {
      const columns = ["Column6", "Column5", "Column1", "Column13"];
      for (const [i, column] of columns.entries()) {
        cy.get(
          `#FeatureImportanceBar svg g.xaxislayer-above g.xtick:nth-child(${
            i + 1
          }) text`
        ).should("contain.text", column);
      }
    });
    it(`should have ${props.dataShape.totalFeatures} elements`, () => {
      expect(props.chart.Elements).length(props.dataShape.totalFeatures);
    });

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
            expect(props.chart.VisibleElements).length(topK + 1);
          });
      });
    });
  });
}
