// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ScatterHighchart } from "../../../util/ScatterHighchart";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { describeAxisConfigDialog } from "./describeAxisConfigDialog";

export function describeIndividualDatapoints(
  dataShape: IModelAssessmentData
): void {
  describe("Individual datapoints chart", () => {
    const props = {
      chart: undefined as unknown as ScatterHighchart,
      dataShape
    };
    beforeEach(() => {
      cy.get(
        '#ChartTypeSelection label:contains("Individual datapoints")'
      ).click();
      props.chart = new ScatterHighchart("#DatasetExplorerChart");
    });
    describe("Dataset explorer Chart", () => {
      it.skip("should have color label", () => {
        cy.get('#DatasetExplorerChart label:contains("Color value")').should(
          "exist"
        );
      });
      it("should render", () => {
        expect(props.chart.Elements.length).greaterThan(0);
      });
      it.skip("Should render datapoint info on hover", () => {
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
        true,
        props.dataShape.featureNames
      );
    }
  });
}
