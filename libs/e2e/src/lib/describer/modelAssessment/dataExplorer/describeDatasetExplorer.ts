// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { visit } from "../../../../util/visit";
import { Locators } from "../Constants";
import { modelAssessmentDatasets } from "../datasets/modelAssessmentDatasets";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { describeAggregatePlot } from "./describeAggregatePlot";
import { describeCohortFunctionality } from "./describeCohortFunctionality";
import { describeIndividualDatapoints } from "./describeIndividualDatapoints";

const testName = "Dataset explorer";

export function describeDatasetExplorer(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasets
): void {
  const isVision =
    datasetShape.isObjectDetection ||
    datasetShape.isMultiLabel ||
    datasetShape.isImageClassification;
  describe(testName, () => {
    before(() => {
      visit(name);
      cy.get("#ModelAssessmentDashboard").should("exist");
      const tab = isVision
        ? Locators.VisionDataAnalysisTab
        : Locators.DataAnalysisTab;
      cy.get(tab).eq(1).click();
    });
    if (datasetShape.featureImportanceData?.noDataset) {
      it("should render no data message", () => {
        cy.get("#MissingParameterPlaceHolder").contains(
          "This tab requires an evaluation dataset be supplied."
        );
      });
      return;
    }
    if (!isVision) {
      describeAggregatePlot(datasetShape);
      describeCohortFunctionality(datasetShape);
      describeIndividualDatapoints(datasetShape);
    }
  });
}
