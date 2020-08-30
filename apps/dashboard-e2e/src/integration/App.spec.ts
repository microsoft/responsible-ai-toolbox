import { getLink } from "../support/App";

describe("dashboard", () => {
  beforeEach(() => cy.visit("/"));

  it("should display Fairlearn link", () => {
    getLink("/fairlearn").should("exist");
  });

  it("should display Interpret link", () => {
    getLink("/interpret").should("exist");
  });
});
