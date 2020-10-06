// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BarChart } from "../../../util/BarChart";
import { IInterpretData } from "../IInterpretData";

import { describeGlobalExplanationChart } from "./describeGlobalExplanationChart";

export function describeGlobalExplanationBarChart(
  dataShape: IInterpretData
): void {
  describe("Bar chart", () => {
    const props = {
      chart: (undefined as unknown) as BarChart,
      dataShape
    };
    beforeEach(() => {
      props.chart = new BarChart("#FeatureImportanceBar");
    });
    it("should be sorted by heigh", () => {
      expect(props.chart.sortByH()).deep.equal(props.chart.Elements);
    });
    describeGlobalExplanationChart(props);
  });
}
