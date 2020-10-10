// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { IInterpretData } from "../IInterpretData";

import { describeAggregatePlot } from "./describeAggregatePlot";
import { describeIndividualDatapoints } from "./describeIndividualDatapoints";

const testName = "Dataset explorer";

export function describeDatasetExplorer(datasetShape: IInterpretData): void {
  describe(testName, () => {
    it("Tab Header should exist", () => {
      getMenu("Dataset explorer", "#DashboardPivot").should("exist");
    });
    describeAggregatePlot(datasetShape);
    describeIndividualDatapoints(datasetShape);
  });
}
