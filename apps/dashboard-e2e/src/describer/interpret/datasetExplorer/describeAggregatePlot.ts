// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BoxChart } from "../../../util/BoxChart";
import { getMenu } from "../../../util/getMenu";
import { IInterpretData } from "../IInterpretData";

import { describeAxisConfigDialog } from "./describeAxisConfigDialog";

export function describeAggregatePlot(dataShape: IInterpretData): void {
  describe("Aggregate plot", () => {
    const props = {
      chart: (undefined as unknown) as BoxChart,
      dataShape
    };
    beforeEach(() => {
      getMenu("Dataset Explorer", "#DashboardPivot")
        .click()
        .get("#DatasetExplorerSettingsButton")
        .click()
        .get(
          '#DatasetExplorerCallout #ChartTypeSelection label:contains("Aggregate plots")'
        )
        .click({ force: true })
        .get("#DatasetExplorerSettingsButton")
        .click();
      props.chart = new BoxChart("#DatasetExplorerChart");
    });
    describe("Dataset Explorer Chart", () => {
      it("should have y axis label", () => {
        cy.get('#DatasetExplorerChart div[class*="rotatedVerticalBox"]').should(
          "contain.text",
          "Y-value"
        );
      });
      it("should have x axis label", () => {
        cy.get(
          '#DatasetExplorerChart div[class*="horizontalAxis"] span[class*="boldText-"]'
        ).should("contain.text", "X-value");
      });
      it("should have x axis bar label", () => {
        const columns = props.dataShape.datasetBarLabel;
        if (columns) {
          for (const [i, column] of columns.entries()) {
            cy.get(
              `#DatasetExplorerChart svg g.xaxislayer-above g.xtick:nth-child(${
                i + 1
              }) text`
            ).should("contain.text", column);
          }
        }
      });
      if (!props.dataShape.noDataset) {
        describe("Chart Settings", () => {
          beforeEach(() => {
            cy.get("#DatasetExplorerSettingsButton").click();
          });
          it("should display settings", () => {
            cy.get("#DatasetExplorerCallout").should("exist");
          });
          it("should be able to hide settings", () => {
            cy.get("#DatasetExplorerSettingsButton").click();
            cy.get("#DatasetExplorerCallout").should("not.exist");
          });
        });
      }
      describeAxisConfigDialog(false);
    });
  });
}
