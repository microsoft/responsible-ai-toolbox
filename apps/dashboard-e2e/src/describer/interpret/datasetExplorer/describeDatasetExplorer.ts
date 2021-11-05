// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../../../util/getMenu";
import { interpretDatasets } from "../interpretDatasets";

import { describeAggregatePlot } from "./describeAggregatePlot";
import { describeIndividualDatapoints } from "./describeIndividualDatapoints";

const testName = "Dataset explorer";

export function describeDatasetExplorer(
  name: keyof typeof interpretDatasets
): void {
  const datasetShape = interpretDatasets[name];
  describe(testName, () => {
    before(() => {
      cy.visit(`#/interpret/${name}/light/english/Version-2`);
      getMenu("Dataset explorer", "#DashboardPivot").click();
    });
    if (datasetShape.noDataset) {
      it("should render no data message", () => {
        cy.get("#MissingParameterPlaceHolder").contains(
          "This tab requires an evaluation dataset be supplied."
        );
      });
      return;
    }
    describeAggregatePlot(datasetShape);
    describeIndividualDatapoints(datasetShape);
  });
}
