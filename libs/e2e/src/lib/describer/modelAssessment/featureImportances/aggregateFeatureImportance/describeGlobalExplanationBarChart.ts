// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BarHighchart } from "../../../../../util/BarHighchart";
import { selectDropdown } from "../../../../../util/dropdown";
import { getMenu } from "../../../../../util/getMenu";
import { IModelAssessmentData } from "../../IModelAssessmentData";

import { describeGlobalExplanationChart } from "./describeGlobalExplanationChart";

export function describeGlobalExplanationBarChart(
  dataShape: IModelAssessmentData
): void {
  describe("Bar chart", () => {
    const props = {
      chart: undefined as unknown as BarHighchart,
      dataShape
    };
    beforeEach(() => {
      props.chart = new BarHighchart("#FeatureImportanceBar");
    });
    before(() => {
      getMenu("Aggregate feature importance").click();
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
  describe.skip("Bar chart - explicit values", () => {
    before(() => {
      getMenu("Aggregate feature importance").click();
    });
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
