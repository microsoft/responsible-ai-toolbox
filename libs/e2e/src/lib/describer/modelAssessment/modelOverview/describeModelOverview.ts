// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { multiSelectComboBox } from "../../../../util/comboBox";
import { visit } from "../../../../util/visit";
import { Locators } from "../Constants";
import { modelAssessmentDatasetsIncludingFlights } from "../datasets/modelAssessmentDatasets";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { ensureChartsPivot } from "./charts";
import { ensureAllModelOverviewBasicElementsArePresent } from "./ensureAllModelOverviewBasicElementsArePresent";
import { ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent } from "./ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent";
import { ensureAllModelOverviewFeatureCohortsViewBasicElementsArePresent } from "./ensureAllModelOverviewFeatureCohortsViewBasicElementsArePresent";
import { ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent } from "./ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent";
import { ensureNewCohortsShowUpInCharts } from "./ensureNewCohortsShowUpInCharts";

const testName = "Model Overview v2";

export function describeModelOverview(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasetsIncludingFlights,
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
          datasetShape,
          isNotebookTest
        );
        multiSelectComboBox(
          "#modelOverviewFeatureSelection",
          datasetShape.modelOverviewData?.featureCohortView
            ?.firstFeatureToSelect || "",
          true
        );
        ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent(
          datasetShape,
          1
        );
      });

      it("should show 'Feature cohorts' view with multiple features when selected", () => {
        multiSelectComboBox(
          "#modelOverviewFeatureSelection",
          datasetShape.modelOverviewData?.featureCohortView
            ?.secondFeatureToSelect || ""
        );
        ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent(
          datasetShape,
          2
        );
      });

      it("should show new cohorts in charts", () => {
        ensureNewCohortsShowUpInCharts(datasetShape, isNotebookTest);
      });

      it("should pivot between charts when clicking", () => {
        ensureChartsPivot(datasetShape, isNotebookTest, true);
      });
    } else {
      it("should not have 'Model overview' component", () => {
        cy.get(Locators.ModelOverview).should("not.exist");
      });
    }
  });
}
