import { toNumber } from "lodash";
import { BarChart } from "../../../support/BarChart";
import { getMenu } from "../../../support/getMenu";

function getTopKValue(): number {
  return toNumber(cy.$$("#TopKSetting input").val());
}

export function describeGlobalExplanationChart(): void {
  describe("Global explanation chart", () => {
    let barChart: BarChart;
    beforeEach(() => {
      getMenu("Aggregate Feature Importance", "#DashboardPivot").click();
      barChart = new BarChart("#FeatureImportanceBar");
    });
    it("should have y axis label", () => {
      cy.get('#FeatureImportanceBar div[class*="rotatedVerticalBox"]').should(
        "contain.text",
        "Aggregate Feature Importance"
      );
    });
    it("should have x axis label", () => {
      const columns = ["Column6", "Column5", "Column1", "Column13"];
      for (let i = 0; i < columns.length; i++) {
        cy.get(
          `#FeatureImportanceBar svg g.xaxislayer-above g.xtick:nth-child(${
            i + 1
          }) text`
        ).should("contain.text", columns[i]);
      }
    });
    it("should have 14 bars", () => {
      cy.get(
        "#FeatureImportanceBar svg .plot .trace.bars .points .point path"
      ).should("have.length", 14);
    });
    it("should have valid coordinates", () => {
      barChart.Bars.each((bar, idx) => {
        expect(
          bar,
          `The ${idx}th bar should have correct coordinates`
        ).not.to.equal(undefined);
      });
    });
    it("should be sorted by x", () => {
      barChart.Bars.then((arr) => {
        const sorted = BarChart.sortByX(arr);
        expect(sorted).to.deep.eq(arr);
      });
    });
    it("should be sorted by heigh", () => {
      barChart.Bars.then((arr) => {
        const sorted = BarChart.sortByH(arr);
        expect(sorted).to.deep.eq(arr);
      });
    });

    describe("Chart Settings", () => {
      beforeEach(() => {
        cy.get("#GlobalExplanationSettingsButton").click();
      });
      it("should display settings", () => {
        cy.get("#GlobalExplanationSettingsCallout").should("exist");
      });
      it("should be able to hide settings", () => {
        cy.get("#GlobalExplanationSettingsButton").click();
        cy.get("#GlobalExplanationSettingsCallout").should("not.exist");
      });
      it("should increase top K setting", () => {
        const topK = getTopKValue();
        cy.get("#TopKSetting input")
          .focus()
          .type("{uparrow}")
          .then(() => {
            barChart.VisibleBars.should("have.length", topK + 1);
          });
      });
      it("chart bars should match top K setting", () => {
        const topK = getTopKValue();
        barChart.VisibleBars.should("have.length", topK);
      });
      it("should show box chart", () => {
        cy.get(
          '#GlobalExplanationSettingsCallout #ChartTypeSelection label:contains("Box")'
        )
          .click({ force: true })
          .get("#FeatureImportanceBar svg .plot .trace.boxes path")
          .should("exist");
      });
    });
  });
}
