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

function getDashboardName(isVision: boolean, isText: boolean): string {
  if (isVision) {
    return "modelAssessmentVision";
  } else if (isText) {
    return "modelAssessmentText";
  }
  return "modelAssessment";
}

export function describeModelOverview(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasetsIncludingFlights,
  isNotebookTest = true
): void {
  describe(testName, () => {
    const isVision =
      datasetShape.isObjectDetection ||
      datasetShape.isImageMultiLabel ||
      datasetShape.isImageClassification
        ? true
        : false;
    const isText =
      datasetShape.isTextClassification || datasetShape.isTextMultiLabel
        ? true
        : false;
    const isTabular = !isVision && !isText;
    if (isNotebookTest) {
      before(() => {
        visit(name);
      });
    } else {
      before(() => {
        const dashboardName = getDashboardName(isVision, isText);
        cy.visit(`#/${dashboardName}/${name}/light/english/Version-2`);
      });
    }

    if (datasetShape.modelOverviewData?.hasModelOverviewComponent) {
      it("should have 'Model overview' component in the initial state", () => {
        ensureAllModelOverviewBasicElementsArePresent(datasetShape);
        ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent(
          datasetShape,
          false,
          isNotebookTest,
          isTabular
        );
      });

      it("should show 'Feature cohorts' view when selected", () => {
        ensureAllModelOverviewBasicElementsArePresent(datasetShape);
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
          1,
          isTabular,
          isVision
        );
      });

      it("should show 'Feature cohorts' view with multiple features when selected", () => {
        cy.get(Locators.ModelOverviewFeatureSelection).click();
        multiSelectComboBox(
          "#modelOverviewFeatureSelection",
          datasetShape.modelOverviewData?.featureCohortView
            ?.secondFeatureToSelect || ""
        );
        ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent(
          datasetShape,
          2,
          isTabular,
          isVision
        );
      });

      it("should show new cohorts in charts", () => {
        ensureNewCohortsShowUpInCharts(datasetShape, isNotebookTest, isTabular);
      });

      it("should pivot between charts when clicking", () => {
        if (isTabular) {
          ensureChartsPivot(datasetShape, isNotebookTest, true);
        }
      });
    } else {
      it("should not have 'Model overview' component", () => {
        cy.get(Locators.ModelOverview).should("not.exist");
      });
    }
  });
}
