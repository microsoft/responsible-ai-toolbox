// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getDefaultTopKWords } from "../getDefaultTopKWords";
import { IInterpretTextData } from "../IInterpretTextData";

import { describeBarChart } from "./describeBarChart";
import { describeClassImportanceWeightsDropdown } from "./describeClassImportanceWeightsDropdown";
import { describeLegend } from "./describeLegend";
import { describeRadioButtonFeatureWeightsSelector } from "./describeRadioButtonFeatureWeightsSelector";
import { describeSlider } from "./describeSlider";
import { describeTextHighlighting } from "./describeTextHighlighting";

const testName = "Individual feature importance";

export function describeTextIndividualFeatureImportance(
  datasetShape: IInterpretTextData
): void {
  describe(testName, () => {
    describeLegend();
    describeTextHighlighting(datasetShape);
    describeBarChart(getDefaultTopKWords(datasetShape.localExplanations));
    describeClassImportanceWeightsDropdown(datasetShape);
    describeSlider(datasetShape);
    describeRadioButtonFeatureWeightsSelector(datasetShape);
  });
}
