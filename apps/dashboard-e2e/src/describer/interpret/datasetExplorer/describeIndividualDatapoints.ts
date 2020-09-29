// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { ScatterChart } from "../../../util/ScatterChart";
import { IInterpretData } from "../IInterpretData";

import { describeAxisConfigDialog } from "./describeAxisConfigDialog";

export function describeIndividualDatapoints(dataShape: IInterpretData): void {
  describe("Individual datapoints chart", () => {
    const props = {
      chart: (undefined as unknown) as ScatterChart,
      dataShape
    };
    beforeEach(() => {
      getMenu("Dataset Explorer", "#DashboardPivot")
        .click()
        .get("#DatasetExplorerSettingsButton")
        .click()
        .get(
          '#DatasetExplorerCallout #ChartTypeSelection label:contains("Individual datapoints")'
        )
        .click({ force: true })
        .get("#DatasetExplorerSettingsButton")
        .click();
      props.chart = new ScatterChart("#DatasetExplorerChart");
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
          '#DatasetExplorerChart div[class*="horizontalAxis"] span[class*="boldText"]'
        ).should("contain.text", "X-value");
      });
      it("should have color label", () => {
        cy.get(
          '#DatasetExplorerChart div[class*="legendAndText"] span[class*="boldText"]'
        ).should("contain.text", "Color value");
      });
      it("should render", () => {
        expect(props.chart.Elements.length).greaterThan(0);
      });
    });
    describeAxisConfigDialog(true);
  });
}
