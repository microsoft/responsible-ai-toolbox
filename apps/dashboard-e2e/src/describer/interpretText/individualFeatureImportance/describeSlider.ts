// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../../../util/Constants";
import { getDefaultTopKWords } from "../../../util/getDefaultTopKWords";
import { validateBarChart } from "../../../util/validateBarChart";
import { IInterpretTextData } from "../IInterpretTextData";

function getSlider(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`${Locators.TextTopKSlider} .ms-Slider-slideBox`);
}

function validateTextBarChart(expectedNumValues: number): void {
  validateBarChart(Locators.TextExplanationChart, expectedNumValues);
}

export function describeSlider(dataShape: IInterpretTextData): void {
  describe("Slider", () => {
    it("should increase number of most important tokens", () => {
      getSlider()
        .focus()
        .type("{rightarrow}")
        .then(() => {
          const expectedNumValues =
            getDefaultTopKWords(dataShape.localExplanations) + 1;
          validateTextBarChart(expectedNumValues);
        });
    });
    it("should decrease number of most important tokens", () => {
      getSlider()
        .focus()
        .type("{leftarrow}{leftarrow}")
        .then(() => {
          const expectedNumValues =
            getDefaultTopKWords(dataShape.localExplanations) - 1;
          validateTextBarChart(expectedNumValues);
        });
    });
  });
}
