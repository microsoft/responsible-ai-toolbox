// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BarHighchart } from "../../../util/BarHighchart";
import { selectDropdown } from "../../../util/dropdown";
import { IInterpretData } from "../IInterpretData";

import { describeGlobalExplanationChart } from "./describeGlobalExplanationChart";

export function describeGlobalExplanationBarChart(
  dataShape: IInterpretData
): void {
  describe("Bar chart", () => {
    const props = {
      chart: undefined as unknown as BarHighchart,
      dataShape
    };
    beforeEach(() => {
      props.chart = new BarHighchart("#FeatureImportanceBar");
    });
    it("should be sorted by height", () => {
      expect(props.chart.sortByH()).deep.equal(props.chart.Elements);
    });

    describeGlobalExplanationChart(props);
  });
}

export function describeGlobalExplanationBarChartExplicitValues(
  dataShape: IInterpretData
): void {
  describe.skip("Bar chart - explicit values", () => {
    it("should have expected explanation values", () => {
      for (const classWeightKey in dataShape.aggregateFeatureImportanceExpectedValues) {
        selectDropdown("#classWeightDropdown", classWeightKey);
        cy.get("#FeatureImportanceBar").should(
          "contain.text",
          dataShape.aggregateFeatureImportanceExpectedValues?.[classWeightKey]
        );
      }
    });
  });
}
