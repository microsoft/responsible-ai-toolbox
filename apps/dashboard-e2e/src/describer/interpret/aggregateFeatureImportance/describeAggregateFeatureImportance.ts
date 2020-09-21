// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { IInterpretData } from "../IInterpretData";

import { describeGlobalExplanationBarChart } from "./describeGlobalExplanationBarChart";
import { describeGlobalExplanationBoxChart } from "./describeGlobalExplanationBoxChart";

const testName = "Aggregate Feature Importance";

export function describeAggregateFeatureImportance(
  datasetName: string,
  datasetShape: IInterpretData
): void {
  describe(testName, () => {
    beforeEach(() => {
      cy.visit(`#/interpret/${datasetName}/light/english/Version-2`);
    });
    it("Tab Header should exist", () => {
      getMenu("Aggregate Feature Importance", "#DashboardPivot").should(
        "exist"
      );
    });
    describeGlobalExplanationBarChart(datasetShape);
    if (!datasetShape.noLocalImportance) {
      describeGlobalExplanationBoxChart(datasetShape);
    }
  });
}
