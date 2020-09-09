import { toNumber } from "lodash";
import { getMenu } from "../../../support/getMenu";
import { Bar } from "../../../support/Bar";

function getSvgWidth(): number | undefined {
  return cy.$$("#FeatureImportanceBar svg").width();
}
function getFeatureBars(): Cypress.Chainable<Array<Bar | undefined>> {
  return cy
    .get("#FeatureImportanceBar svg .plot .trace.bars .points .point path")
    .then((e) => Bar.getCoordinates(e));
}
function getVisibleBars(): Cypress.Chainable<Array<Bar | undefined>> {
  const svgWidth = getSvgWidth() || 0;
  return getFeatureBars().then((bs) => {
    return bs.filter((bar) => (bar && bar.x + bar.w < svgWidth) || false);
  });
}
function getTopKValue(): number {
  return toNumber(cy.$$("#TopKSetting input").val());
}

export function describeGlobalExplanationChart(): void {
  describe("Global explanation chart", () => {
    let bars: Cypress.Chainable<Array<Bar | undefined>>;
    beforeEach(() => {
      getMenu("Aggregate Feature Importance", "#DashboardPivot").click();
      bars = getFeatureBars();
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
      bars.each((bar, idx) => {
        expect(
          bar,
          `The ${idx}th bar should have correct coordinates`
        ).not.to.equal(undefined);
      });
    });
    it("should be sorted by x", () => {
      bars.then((arr) => {
        const sorted = Bar.sortByX(arr);
        expect(sorted).to.deep.eq(arr);
      });
      it("should be sorted by heigh", () => {
        bars.then((arr) => {
          const sorted = Bar.sortByH(arr);
          expect(sorted).to.deep.eq(arr);
        });
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

      it("chart should match setting", () => {
        const topK = getTopKValue();
        getVisibleBars().should("have.length", topK);
      });
    });
  });
}
