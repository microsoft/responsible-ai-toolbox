// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BarChart } from "../../../../../../util/BarChart";
import { selectDropdown } from "../../../../../../util/dropdown";
import { IModelAssessmentData } from "../../IModelAssessmentData";

import { describeGlobalExplanationChart } from "./describeGlobalExplanationChart";

export function describeGlobalExplanationBarChart(
  dataShape: IModelAssessmentData
): void {
  describe("Bar chart", () => {
    const props = {
      chart: undefined as unknown as BarChart,
      dataShape
    };
    beforeEach(() => {
      props.chart = new BarChart("#FeatureImportanceBar");
    });
    it("should be sorted by height", () => {
      expect(props.chart.sortByH()).deep.equal(props.chart.Elements);
    });

    describeGlobalExplanationChart(props);
  });
}

export function describeGlobalExplanationBarChartExplicitValues(
  dataShape: IModelAssessmentData
): void {
  describe("Bar chart - explicit values", () => {
    it("should have expected explanation values", () => {
      for (const classWeightKey in dataShape.featureImportanceData
        ?.aggregateFeatureImportanceExpectedValues) {
        selectDropdown("#classWeightDropdown", classWeightKey);
        cy.get("#FeatureImportanceBar").should(
          "contain.text",
          dataShape.featureImportanceData
            ?.aggregateFeatureImportanceExpectedValues?.[classWeightKey]
        );
      }
    });
  });
}
