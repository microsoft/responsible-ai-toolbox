// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../../../util/Constants";
import {
  selectDropdownWithKeys,
  getDropdownValue
} from "../../../util/dropdown";
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
      selectDropdownWithKeys(Locators.ClassImportanceWeights).then(() => {
        validateTextBarChart(getDefaultTopKWords(dataShape.localExplanations));
      });
      selectDropdownWithKeys(Locators.ClassImportanceWeights).then(() => {
        validateTextBarChart(getDefaultTopKWords(dataShape.localExplanations));
      });
    });
  });
}
