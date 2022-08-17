// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getDefaultTopKWords } from "../../../util/getDefaultTopKWords";
import { interpretTextDatasets } from "../interpretTextDatasets";

import { describeBarChart } from "./describeBarChart";
import { describeClassImportanceWeightsDropdown } from "./describeClassImportanceWeightsDropdown";
import { describeLegend } from "./describeLegend";
import { describeSlider } from "./describeSlider";
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
    describeBarChart(getDefaultTopKWords(datasetShape.localExplanations));
    describeClassImportanceWeightsDropdown(datasetShape);
    describeSlider(datasetShape);
  });
}
