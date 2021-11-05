// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BoxChart } from "../../../../../util/BoxChart";
import { IInterpretData } from "../IInterpretData";

import { describeAxisConfigDialog } from "./describeAxisConfigDialog";

export function describeAggregatePlot(dataShape: IInterpretData): void {
  describe("Aggregate plot", () => {
    const props = {
      chart: undefined as unknown as BoxChart,
      dataShape
    };
    beforeEach(() => {
      cy.get('#ChartTypeSelection label:contains("Aggregate plots")').click();
      props.chart = new BoxChart("#DatasetExplorerChart");
    });
    describe("Dataset explorer Chart", () => {
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
      if (dataShape.defaultXAxis && dataShape.defaultYAxis) {
        describeAxisConfigDialog(
          dataShape.defaultXAxis,
          dataShape.defaultYAxis,
          !!dataShape.noY,
          false
        );
      }
    });
  });
}
