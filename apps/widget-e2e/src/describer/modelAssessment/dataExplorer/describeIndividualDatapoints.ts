// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ScatterChart } from "../../../util/ScatterChart";
import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { describeAxisConfigDialog } from "./describeAxisConfigDialog";

export function describeIndividualDatapoints(
  dataShape: IModelAssessmentData
): void {
  describe("Individual datapoints chart", () => {
    const props = {
      chart: undefined as unknown as ScatterChart,
      dataShape
    };
    beforeEach(() => {
      cy.get(
        '#ChartTypeSelection label:contains("Individual datapoints")'
      ).click();
      props.chart = new ScatterChart("#DatasetExplorerChart");
    });
    describe("Dataset explorer Chart", () => {
      it("should have color label", () => {
        cy.get('#DatasetExplorerChart label:contains("Color value")').should(
          "exist"
        );
      });
      it("should render", () => {
        expect(props.chart.Elements.length).greaterThan(0);
      });

      it("Selecting 'color value' should render flyout", () => {
        cy.get(
          `#DatasetExplorerChart button:contains(${props.dataShape.datasetExplorerData?.colorValueButton})`
        ).click();
        cy.get(Locators.DECAxisPanel).should("exist");
        cy.get(Locators.CancelButton).click();
      });
      it("Should render datapoint info on hover", () => {
        props.chart.clickNthPoint(15);
        cy.get("#DatasetExplorerChart").should(
          "contain",
          `${props.dataShape.datasetExplorerData?.defaultXAxis}:`
        );
        props.chart.clickNthPoint(15);
      });
    });
    if (
      props.dataShape.datasetExplorerData?.defaultXAxis &&
      props.dataShape.datasetExplorerData?.defaultYAxis
    ) {
      describeAxisConfigDialog(
        props.dataShape.datasetExplorerData?.defaultXAxis,
        props.dataShape.datasetExplorerData?.defaultYAxis,
        !!props.dataShape.datasetExplorerData?.noY,
        true
      );
    }
  });
}
