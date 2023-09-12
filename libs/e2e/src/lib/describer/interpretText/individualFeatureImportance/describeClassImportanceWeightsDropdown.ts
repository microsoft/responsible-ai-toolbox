// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { selectDropdown, getDropdownValue } from "../dropdown";
import { getDefaultTopKWords } from "../getDefaultTopKWords";
import { IInterpretTextData } from "../IInterpretTextData";
import { validateBarChart } from "../validateBarChart";

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
      dataShape.classNames.forEach((className) => {
        selectDropdown(Locators.TextWordsDropdown, `Class: ${className}`).then(
          () => {
            validateTextBarChart(
              getDefaultTopKWords(dataShape.localExplanations)
            );
          }
        );
      });
    });
  });
}
