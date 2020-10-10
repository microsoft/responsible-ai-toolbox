// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { IInterpretData } from "../IInterpretData";

import { describeDataPointChart } from "./describeDataPointChart";

const testName = "Individual feature importance";

export function describeIndividualFeatureImportance(
  datasetShape: IInterpretData
): void {
  describe(testName, () => {
    it("Tab Header should exist", () => {
      getMenu("Individual feature importance", "#DashboardPivot").should(
        "exist"
      );
    });
    describeDataPointChart(datasetShape);
  });
}
