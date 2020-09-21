// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "../../util/getSpan";

describe("dashboard", () => {
  beforeEach(() => {
    cy.visit(
      "http://localhost:4200/#/fairness/binaryClassifier/light/english/Version-2"
    );
  });

  it("should display header", () => {
    getSpan("Fairness dashboard").should("exist");
  });
});
