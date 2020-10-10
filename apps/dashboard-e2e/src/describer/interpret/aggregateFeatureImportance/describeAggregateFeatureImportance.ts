// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { IInterpretData } from "../IInterpretData";

import { describeGlobalExplanationBarChart } from "./describeGlobalExplanationBarChart";
import { describeGlobalExplanationBoxChart } from "./describeGlobalExplanationBoxChart";

const testName = "Aggregate feature importance";

export function describeAggregateFeatureImportance(
  datasetShape: IInterpretData
): void {
  describe(testName, () => {
    beforeEach(() => {
      getMenu("Aggregate feature importance", "#DashboardPivot").click();
    });
    it("Tab Header should exist", () => {
      getMenu("Aggregate feature importance", "#DashboardPivot").should(
        "exist"
      );
    });
    describeGlobalExplanationBarChart(datasetShape);
    if (!datasetShape.noLocalImportance) {
      describeGlobalExplanationBoxChart(datasetShape);
    }
  });
}
