// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { interpretTextDatasets } from "../interpretTextDatasets";

import { describeBarChart } from "./describeBarChart";
import { describeLegend } from "./describeLegend";
import { describeTextHighlighting } from "./describeTextHighlighting";

const testName = "Individual feature importance";

export function describeIndividualFeatureImportance(
  name: keyof typeof interpretTextDatasets
): void {
  const datasetShape = interpretTextDatasets[name];
  describe(testName, () => {
    before(() => {
      cy.visit(`#/interpretText/${name}/light/english/Version-1`);
    });
    describeLegend();
    describeTextHighlighting(datasetShape);
    describeBarChart(datasetShape);
  });
}
