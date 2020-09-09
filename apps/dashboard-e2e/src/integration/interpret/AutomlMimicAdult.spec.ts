import { getMenu } from "../../support/App";

describe("dashboard", () => {
  beforeEach(() => {
    cy.visit("#/interpret/automlMimicAdult/light/english/Version-2");
  });

  it("should have Aggregate Feature Importance", () => {
    getMenu("Aggregate Feature Importance", "#DashboardPivot").should("exist");
  });

  describe("Aggregate Feature Importance", () => {
    beforeEach(() => {
      getMenu("Aggregate Feature Importance", "#DashboardPivot").click();
    });
    it("should have y axis label", () => {
      cy.get('#FeatureImportanceBar div[class*="rotatedVerticalBox"]').should(
        "contain.text",
        "Aggregate Feature Importance"
      );
    });
    it("should have x axis label", () => {
      const columns = ["Column6", "Column5", "Column1", "Column11"];
      for (let i = 0; i < columns.length; i++) {
        cy.get(
          `#FeatureImportanceBar svg g.xaxislayer-above g.xtick:nth-child(${
            i + 1
          }) text`
        ).should("contain.text", columns[i]);
      }
    });
    it("should have x axis label", () => {
      const columns = ["Column6", "Column5", "Column1", "Column11"];
      for (let i = 0; i < columns.length; i++) {
        cy.get(
          `#FeatureImportanceBar svg g.xaxislayer-above g.xtick:nth-child(${
            i + 1
          }) text`
        ).should("contain.text", columns[i]);
      }
    });
  });
});
