// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { multiSelectComboBox } from "../../../../util/comboBox";
import { visit } from "../../../../util/visitVision";
import { Locators } from "../Constants";
import { modelAssessmentVisionDatasets } from "../datasets/modelAssessmentVisionDatasets";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { ensureAllModelOverviewBasicElementsArePresent } from "./ensureAllModelOverviewBasicElementsArePresent";
import { ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent } from "./ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent";
import { ensureAllModelOverviewFeatureCohortsViewBasicElementsArePresent } from "./ensureAllModelOverviewFeatureCohortsViewBasicElementsArePresent";
import { ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent } from "./ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent";

const testName = "Model Overview v2";

export function describeVisionModelOverview(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentVisionDatasets,
  isNotebookTest = true
): void {
  describe(testName, () => {
    if (isNotebookTest) {
      before(() => {
        visit(name);
      });
    } else {
      before(() => {
        cy.visit(`#/modelAssessment/${name}/light/english/Version-2`);
      });
    }

    if (datasetShape.modelOverviewData?.hasModelOverviewComponent) {
      it("should have 'Model overview' component in the initial state", () => {
        ensureAllModelOverviewBasicElementsArePresent();
        ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent(
          datasetShape,
          false,
          isNotebookTest
        );
      });

      it("should show 'Feature cohorts' view when selected", () => {
        ensureAllModelOverviewBasicElementsArePresent();
        cy.get(Locators.ModelOverviewCohortViewFeatureCohortViewButton).click();
        ensureAllModelOverviewFeatureCohortsViewBasicElementsArePresent(
          isNotebookTest
        );
        multiSelectComboBox(
          "#modelOverviewFeatureSelection",
          datasetShape.modelOverviewData?.featureCohortView
            ?.firstFeatureToSelect || "",
          true
        );
        ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent();
      });

      it("should show 'Feature cohorts' view with multiple features when selected", () => {
        multiSelectComboBox(
          "#modelOverviewFeatureSelection",
          datasetShape.modelOverviewData?.featureCohortView
            ?.secondFeatureToSelect || ""
        );
        ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent();
      });
    } else {
      it("should not have 'Model overview' component", () => {
        cy.get(Locators.ModelOverview).should("not.exist");
      });
    }
  });
}
