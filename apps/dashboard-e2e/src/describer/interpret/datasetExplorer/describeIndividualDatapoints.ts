// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ScatterHighchart } from "../../../util/ScatterHighchart";
import { IInterpretData } from "../IInterpretData";

import { describeAxisConfigDialog } from "./describeAxisConfigDialog";

export function describeIndividualDatapoints(dataShape: IInterpretData): void {
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
    });
    if (dataShape.defaultXAxis && dataShape.defaultYAxis) {
      describeAxisConfigDialog(
        dataShape.defaultXAxis,
        dataShape.defaultYAxis,
        !!dataShape.noY,
        true
      );
    }
  });
}
