// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../../../util/Constants";
import { selectDropdown, getDropdownValue } from "../../../util/dropdown";
import { getDefaultTopKWords } from "../../../util/getDefaultTopKWords";
import { validateBarChart } from "../../../util/validateBarChart";
import { IInterpretTextData } from "../IInterpretTextData";

function validateTextBarChart(expectedNumValues: number): void {
  validateBarChart(Locators.TextExplanationChart, expectedNumValues);
}

export function describeClassImportanceWeightsDropdown(
  dataShape: IInterpretTextData
): void {
  expect(dataShape.localExplanations.length).greaterThan(0);
  describe("Dropdown", () => {
    it("should default to average of absolute value", () => {
      expect("Average of absolute value").to.equal(
        getDropdownValue(Locators.ClassImportanceWeights)
      );
    });
    it("should be selectable for different classes", () => {
      selectDropdown(Locators.TextWordsDropdown, "Class: spam").then(() => {
        validateTextBarChart(getDefaultTopKWords(dataShape.localExplanations));
      });
      selectDropdown(Locators.TextWordsDropdown, "Class: not spam").then(() => {
        validateTextBarChart(getDefaultTopKWords(dataShape.localExplanations));
      });
    });
  });
}
