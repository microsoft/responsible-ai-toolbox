// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ScatterChart } from "../../../util/ScatterChart";
import { getMenu } from "../../../util/getMenu";
import { IInterpretData } from "../IInterpretData";

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
      it("should render", () => {
        expect(props.chart.Elements.length).greaterThan(0);
      });
    });
  });
}
