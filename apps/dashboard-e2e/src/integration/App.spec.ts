import { getMenu } from "../support/App";
const topMenu = "#topMenuBar";
describe("dashboard", () => {
  beforeEach(() => cy.visit("/"));

  it("should contains Application link", () => {
    getMenu("Application", topMenu).should("exist");
  });

  it("should contains Version link", () => {
    getMenu("Version", topMenu).should("exist");
  });

  it("should contains Dataset link", () => {
    getMenu("Dataset", topMenu).should("exist");
  });

  it("should contains Theme link", () => {
    getMenu("Theme", topMenu).should("exist");
  });

  it("should contains Language link", () => {
    getMenu("Language", topMenu).should("exist");
  });
});
