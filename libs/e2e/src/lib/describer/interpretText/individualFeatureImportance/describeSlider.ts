// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MaxImportantWords } from "@responsible-ai/interpret-text";

import { Locators } from "../Constants";
import { getDefaultTopKWords } from "../getDefaultTopKWords";
import { IInterpretTextData } from "../IInterpretTextData";
import { validateBarChart } from "../validateBarChart";

function getSlider(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`${Locators.TextTopKSlider} .ms-Slider-slideBox`);
}

function validateTextBarChart(expectedNumValues: number): void {
  validateBarChart(Locators.TextExplanationChart, expectedNumValues);
}

export function describeSlider(dataShape: IInterpretTextData): void {
  describe("Slider", () => {
    const isAtMax =
      getDefaultTopKWords(dataShape.localExplanations) === MaxImportantWords;
    let expectedNumValues = getDefaultTopKWords(dataShape.localExplanations);
    it("should increase number of most important tokens", () => {
      getSlider()
        .focus()
        .type("{rightarrow}")
        .then(() => {
          if (!isAtMax) {
            expectedNumValues += 1;
          }
          validateTextBarChart(expectedNumValues);
        });
    });
    it("should decrease number of most important tokens", () => {
      getSlider()
        .focus()
        .type("{leftarrow}{leftarrow}")
        .then(() => {
          expectedNumValues -= 2;
          validateTextBarChart(expectedNumValues);
        });
    });
  });
}
