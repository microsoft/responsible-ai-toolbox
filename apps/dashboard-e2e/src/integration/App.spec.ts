// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
const topMenu = "#TopMenuBar";
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
