// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { describeAggregateFeatureImportance } from "./aggregateFeatureImportance/describeAggregateFeatureImportance";
import { describeCohort } from "./cohort/describeCohort";
import { describeDatasetExplorer } from "./datasetExplorer/describeDatasetExplorer";
import { describeIndividualFeatureImportance } from "./individualFeatureImportance/describeIndividualFeatureImportance";
import { interpretDatasets } from "./interpretDatasets";

export function describeInterpret(name: keyof typeof interpretDatasets): void {
  describe(name, () => {
    beforeEach(() => {
      cy.visit(`#/interpret/${name}/light/english/Version-2`);
    });
    if (interpretDatasets[name].errorMessage) {
      it("should have error message", () => {
        cy.get("#ErrorMessage").should(
          "contain.text",
          "Inconsistent dimensions. Predicted probability[0] has dimensions 2, expected 1"
        );
      });
    } else {
      it("should not have error message", () => {
        cy.get("#ErrorMessage").should("not.exist");
      });
    }
    describeCohort(interpretDatasets[name]);
    if (!interpretDatasets[name].noFeatureImportance) {
      describeAggregateFeatureImportance(interpretDatasets[name]);
    }
    if (!interpretDatasets[name].noDataset) {
      describeDatasetExplorer(interpretDatasets[name]);
      describeIndividualFeatureImportance(interpretDatasets[name]);
    }
  });
}
