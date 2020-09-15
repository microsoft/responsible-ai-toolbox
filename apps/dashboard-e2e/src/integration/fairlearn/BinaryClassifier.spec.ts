// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "../../support/getSpan";

describe("dashboard", () => {
  beforeEach(() => {
    cy.visit(
      "http://localhost:4200/#/fairlearn/binaryClassifier/light/english/Version-2"
    );
  });

  it("should display header", () => {
    getSpan("Fairlearn dashboard").should("exist");
  });
});
