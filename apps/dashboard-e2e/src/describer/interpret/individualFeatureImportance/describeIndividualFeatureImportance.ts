// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { interpretDatasets } from "../interpretDatasets";

import { describeDataPointChart } from "./describeDataPointChart";
import { describeWhatIf } from "./describeWhatIf";

const testName = "Individual feature importance";

export function describeIndividualFeatureImportance(
  name: keyof typeof interpretDatasets
): void {
  const datasetShape = interpretDatasets[name];
  describe(testName, () => {
    beforeEach(() => {
      cy.visit(`#/interpret/${name}/light/english/Version-2`);
      getMenu("Individual feature importance", "#DashboardPivot").click();
    });
    if (datasetShape.noDataset) {
      it("should render no data message", () => {
        cy.get("#MissingParameterPlaceHolder").contains(
          "This tab requires an evaluation dataset be supplied."
        );
      });
      return;
    }
    describeDataPointChart(datasetShape);
    if (!datasetShape.noPredict) {
      describeWhatIf(datasetShape);
    }
  });
}
