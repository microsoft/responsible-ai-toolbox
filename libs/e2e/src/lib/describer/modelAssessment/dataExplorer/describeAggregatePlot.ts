// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BoxChart } from "../../../../util/BoxChart";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { describeAxisConfigDialog } from "./describeAxisConfigDialog";

export function describeAggregatePlot(dataShape: IModelAssessmentData): void {
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
        const columns = props.dataShape.datasetExplorerData?.datasetBarLabel;
        if (columns) {
          for (const [i, column] of columns.entries()) {
            cy.get(
              `#DatasetExplorerChart g.highcharts-xaxis-labels text:nth-child(${
                i + 1
              })`
            ).should("contain.text", column);
          }
        }
      });
      if (
        props.dataShape.datasetExplorerData?.defaultXAxis &&
        props.dataShape.datasetExplorerData?.defaultYAxis
      ) {
        describeAxisConfigDialog(
          props.dataShape.datasetExplorerData?.defaultXAxis,
          props.dataShape.datasetExplorerData?.defaultYAxis,
          !!props.dataShape.datasetExplorerData?.noY,
          false,
          props.dataShape.featureNames
        );
      }
    });
  });
}
