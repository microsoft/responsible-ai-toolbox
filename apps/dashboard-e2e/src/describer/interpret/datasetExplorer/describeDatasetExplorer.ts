// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { interpretDatasets } from "../interpretDatasets";

import { describeAggregatePlot } from "./describeAggregatePlot";
import { describeIndividualDatapoints } from "./describeIndividualDatapoints";

const testName = "Dataset explorer";

export function describeDatasetExplorer(
  name: keyof typeof interpretDatasets
): void {
  const datasetShape = interpretDatasets[name];
  if (datasetShape.noDataset) {return;}
  describe(testName, () => {
    beforeEach(() => {
      cy.visit(`#/interpret/${name}/light/english/Version-2`);
    });
    it("Tab Header should exist", () => {
      getMenu("Dataset explorer", "#DashboardPivot").should("exist");
    });
    describeAggregatePlot(datasetShape);
    describeIndividualDatapoints(datasetShape);
  });
}
