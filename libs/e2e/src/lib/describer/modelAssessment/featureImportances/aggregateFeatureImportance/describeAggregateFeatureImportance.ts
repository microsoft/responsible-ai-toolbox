// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../../../util/getMenu";
import { visit } from "../../../../../util/visit";
import { modelAssessmentDatasets } from "../../datasets/modelAssessmentDatasets";
import { IModelAssessmentData } from "../../IModelAssessmentData";

import { describeCohortFunctionality } from "./describeCohortFunctionality";
import {
  describeGlobalExplanationBarChart,
  describeGlobalExplanationBarChartExplicitValues,
  describeGlobalExplanationChartAvgOfAbsOption
} from "./describeGlobalExplanationBarChart";
import { describeGlobalExplanationBoxChart } from "./describeGlobalExplanationBoxChart";

const testName = "Aggregate feature importance";

export function describeAggregateFeatureImportance(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasets
): void {
  if (datasetShape.featureImportanceData?.noFeatureImportance) {
    return;
  }
  describe(testName, () => {
    before(() => {
      visit(name);
      cy.get("#ModelAssessmentDashboard").should("exist");
    });
    if (!datasetShape.featureImportanceData?.hasFeatureImportanceComponent) {
      it("should not have 'Feature importance' for decision making notebooks", () => {
        getMenu("Aggregate feature importance").should("not.exist");
      });
    }
    if (datasetShape.featureImportanceData?.hasFeatureImportanceComponent) {
      describeGlobalExplanationBarChart(datasetShape);
      if (
        datasetShape.featureImportanceData
          ?.aggregateFeatureImportanceExpectedValues
      ) {
        describeGlobalExplanationBarChartExplicitValues(datasetShape);
      }
      if (!datasetShape.featureImportanceData?.noLocalImportance) {
        describeGlobalExplanationBoxChart(datasetShape);
      }
      if (!datasetShape.isRegression) {
        describeGlobalExplanationChartAvgOfAbsOption(datasetShape);
      }
      describeCohortFunctionality();
    }
  });
}
