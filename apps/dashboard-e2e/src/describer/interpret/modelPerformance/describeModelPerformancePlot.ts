// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { interpretDatasets } from "../interpretDatasets";

import { describeAxisConfigDialog } from "./describeAxisConfigDialog";
import { describeModelPerformanceStats } from "./describeModelPerformanceStats";

const testName = "Model performance plot";
export function describeModelPerformancePlot(
  name: keyof typeof interpretDatasets
): void {
  const datasetShape = interpretDatasets[name];
  describe(testName, () => {
    beforeEach(() => {
      cy.visit(`#/interpret/${name}/light/english/Version-2`);
      getMenu("Model performance", "#DashboardPivot").click();
    });
    if (datasetShape.noPredict) {
      it("should render no data message", () => {
        cy.get("#MissingParameterPlaceHolder").contains(
          "This tab requires the array of predicted values from the model be supplied."
        );
      });
      return;
    }
    describe("Model performance Chart", () => {
      describeAxisConfigDialog();
    });
    describe("Model performance stats", () => {
      describeModelPerformanceStats(datasetShape);
    });
  });
}
