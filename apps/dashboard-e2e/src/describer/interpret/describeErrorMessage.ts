// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { interpretDatasets } from "./interpretDatasets/interpretDatasets";

export function describeErrorMessage(
  name: keyof typeof interpretDatasets
): void {
  describe(name, () => {
    beforeEach(() => {
      cy.visit(`#/interpret/${name}/light/english/Version-2`);
    });
    if (interpretDatasets[name].errorMessage) {
      it("should have error message", () => {
        cy.get("#ErrorMessage").should(
          "contain.text",
          "Inconsistent dimensions. Predicted probability[0] has dimensions 2, expected 1"
        );
      });
    } else {
      it("should not have error message", () => {
        cy.get("#ErrorMessage").should("not.exist");
      });
    }
  });
}
