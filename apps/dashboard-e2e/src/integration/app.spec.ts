import { getLink } from "../support/app.po";

describe("dashboard", () => {
  beforeEach(() => cy.visit("/"));

  it("should display Fairlearn link", () => {
    getLink("/fairlearn").contains("Fairlearn");
  });

  it("should display Interpret link", () => {
    getLink("/interpret").contains("Interpret");
  });
});
