// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BarChart } from "../../../support/BarChart";
import { getMenu } from "../../../support/getMenu";
import { IDataSetShape } from "../IDataSetShape";
import { describeGlobalExplanationChart } from "./describeGlobalExplanationChart";

export function describeGlobalExplanationBarChart(
  dataShape: IDataSetShape
): void {
  describe("Bar chart", () => {
    const props = {
      chart: (undefined as unknown) as BarChart,
      dataShape
    };
    beforeEach(() => {
      getMenu("Aggregate Feature Importance", "#DashboardPivot").click();
      props.chart = new BarChart("#FeatureImportanceBar");
    });
    it("should be sorted by heigh", () => {
      expect(props.chart.sortByH()).deep.equal(props.chart.Elements);
    });
    describeGlobalExplanationChart(props);
  });
}
