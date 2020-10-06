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
        .get('#ChartTypeSelection label:contains("Individual datapoints")')
        .click();
      props.chart = new ScatterChart("#DatasetExplorerChart");
    });
    describe("Dataset Explorer Chart", () => {
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
