// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { interpretDatasets } from "../interpretDatasets";

import { describeGlobalExplanationBarChart } from "./describeGlobalExplanationBarChart";
import { describeGlobalExplanationBoxChart } from "./describeGlobalExplanationBoxChart";

const testName = "Aggregate feature importance";

export function describeAggregateFeatureImportance(
  name: keyof typeof interpretDatasets
): void {
  const datasetShape = interpretDatasets[name];
  if (datasetShape.noFeatureImportance) {
    return;
  }
  describe(testName, () => {
    beforeEach(() => {
      cy.visit(`#/interpret/${name}/light/english/Version-2`);
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
