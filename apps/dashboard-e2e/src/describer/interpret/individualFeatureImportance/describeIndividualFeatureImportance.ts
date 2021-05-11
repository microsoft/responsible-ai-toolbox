// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { interpretDatasets } from "../interpretDatasets";

import { describeDataPointChart } from "./describeDataPointChart";
import { describeWhatIf } from "./describeWhatIf";

const testName = "Individual feature importance";

export function describeIndividualFeatureImportance(
  name: keyof typeof interpretDatasets
): void {
  const datasetShape = interpretDatasets[name];
  if (datasetShape.noDataset) {
    return;
  }
  describe(testName, () => {
    beforeEach(() => {
      cy.visit(`#/interpret/${name}/light/english/Version-2`);
    });
    it("Tab Header should exist", () => {
      getMenu("Individual feature importance", "#DashboardPivot").should(
        "exist"
      );
    });
    describeDataPointChart(datasetShape);
    if (!datasetShape.noPredict) {
      describeWhatIf(datasetShape);
    }
  });
}
