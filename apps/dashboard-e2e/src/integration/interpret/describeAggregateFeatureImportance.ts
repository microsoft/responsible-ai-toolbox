import { getMenu } from "../../support/getMenu";
import { Bar } from "../../support/Bar";

export function describeAggregateFeatureImportance(
  dataset: string
): () => void {
  return (): void => {
    describe("Aggregate Feature Importance", () => {
      beforeEach(() => {
        cy.visit(`#/interpret/${dataset}/light/english/Version-2`);
      });

      it("should have Aggregate Feature Importance Tab", () => {
        getMenu("Aggregate Feature Importance", "#DashboardPivot").should(
          "exist"
        );
      });

      describe("Global explanation chart", () => {
        let bars: Cypress.Chainable<Array<Bar | undefined>>;
        beforeEach(() => {
          getMenu("Aggregate Feature Importance", "#DashboardPivot").click();
          bars = cy
            .get(
              "#FeatureImportanceBar svg .plot .trace.bars .points .point path"
            )
            .then((e) => Bar.getCoordinates(e));
        });
        it("should have y axis label", () => {
          cy.get(
            '#FeatureImportanceBar div[class*="rotatedVerticalBox"]'
          ).should("contain.text", "Aggregate Feature Importance");
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
      });
    });
  };
}
