// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BoxChart } from "../../../util/BoxChart";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeModelPerformanceBoxChart(
  dataShape: IModelAssessmentData
): void {
  describe("Model performance box chart", () => {
    const props = {
      chart: undefined as unknown as BoxChart,
      dataShape
    };
    beforeEach(() => {
      props.chart = new BoxChart("#ModelPerformanceChart");
    });
    it("should render", () => {
      expect(props.chart.Elements.length).greaterThan(0);
    });
  });
}
