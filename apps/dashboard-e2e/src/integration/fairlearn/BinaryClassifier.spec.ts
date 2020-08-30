import { getSpan, selectDataset, selectVersion } from "../../support/App";

describe("dashboard", () => {
  beforeEach(() => {
    cy.visit("/#/fairlearn");
    selectDataset("binaryClassifier");
    selectVersion(2);
  });

  it("should display header", () => {
    getSpan("Fairlearn dashboard").should("exist");
  });
});
