// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../../util/getMenu";
import { RAINotebookNames } from "../../IModelAssessmentData";
import { modelAssessmentDatasets } from "../../modelAssessmentDatasets";

import { describeCohortFunctionality } from "./describeCohortFunctionality";
import {
  describeGlobalExplanationBarChart,
  describeGlobalExplanationBarChartExplicitValues
} from "./describeGlobalExplanationBarChart";
import { describeGlobalExplanationBoxChart } from "./describeGlobalExplanationBoxChart";

const testName = "Aggregate feature importance";

export function describeAggregateFeatureImportance(
  name: keyof typeof modelAssessmentDatasets
): void {
  const datasetShape = modelAssessmentDatasets[name];
  if (datasetShape.featureImportanceData?.noFeatureImportance) {
    return;
  }
  describe(testName, () => {
    before(() => {
      const hosts = Cypress.env().hosts;
      cy.task("log", hosts);
      const hostDetails = hosts.find((obj: { file: string }) => {
        cy.task("log", name);
        cy.task("log", RAINotebookNames[name]);

        return obj.file === RAINotebookNames[name];
      });
      cy.task("log", hostDetails.host);
      cy.visit(hostDetails.host);
      cy.get("#ModelAssessmentDashboard").should("exist");
      getMenu("Aggregate feature importance").click();
    });
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
    describeCohortFunctionality();
  });
}
