// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IInterpretTextData } from "../IInterpretTextData";

export function describeTextHighlighting(dataShape: IInterpretTextData): void {
  describe("TextHighlighting", () => {
    it("should exist", () => {
      cy.get(Locators.TextHighlighting).should("exist");
    });
    it("should contain all words in text", () => {
      dataShape.text.forEach((word) => {
        cy.get(Locators.TextHighlighting).should("contain.text", word);
      });
    });
  });
}
