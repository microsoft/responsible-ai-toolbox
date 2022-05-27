// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../../Constants";
import {
  IModelAssessmentData,
  RAINotebookNames
} from "../../IModelAssessmentData";
import { modelAssessmentDatasetsIncludingFlights } from "../../modelAssessmentDatasets";

const testName = "Model Overview v2";

export function describeNewModelOverview(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasetsIncludingFlights
): void {
  describe(testName, () => {
    before(() => {
      if (name) {
        const hosts = Cypress.env().hosts;
        const hostDetails = hosts.find((obj: { file: string }) => {
          return obj.file === RAINotebookNames[name];
        });
        cy.task("log", hostDetails.host);
        cy.visit(hostDetails.host);
      }
    });
    it("should have 'Model overview' component in the initial state", () => {
      cy.get(Locators.ModelOverviewHeader).should("exist");
      cy.get(Locators.ModelOverviewDescription).should("exist");
      cy.get(Locators.ModelOverviewCohortViewSelector).should("exist");
      cy.get(Locators.ModelOverviewMetricSelection).should("exist");
      cy.get(Locators.ModelOverviewFeatureSelection).should("not.exist");
      cy.get(Locators.ModelOverviewFeatureConfigurationActionButton).should(
        "not.exist"
      );
      cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should(
        "not.exist"
      );
      //cy.get(Locators.ModelOverviewDatasetCohortStatsTable).should("exist");
      //cy.get(Locators.ModelOverviewDisaggregatedAnalysisTable).should("not.exist");
      cy.get(Locators.ModelOverviewTableYAxisGrid).should(
        "include.text",
        datasetShape.modelOverviewData?.initialCohort.name
      );
      cy.get(Locators.ModelOverviewHeatmapCells)
        .first()
        .should(
          "include.text",
          datasetShape.modelOverviewData?.initialCohort.sampleSize
        )
        .next()
        .should(
          "include.text",
          datasetShape.modelOverviewData?.initialCohort.metrics[
            "meanAbsoluteError"
          ]
        )
        .next()
        .should(
          "include.text",
          datasetShape.modelOverviewData?.initialCohort.metrics[
            "meanSquaredError"
          ]
        )
        .next()
        .should(
          "include.text",
          datasetShape.modelOverviewData?.initialCohort.metrics[
            "meanPrediction"
          ]
        );
      cy.get(Locators.ModelOverviewDisaggregatedAnalysisBaseCohortDisclaimer).should("not.exist");
      cy.get(Locators.ModelOverviewDisaggregatedAnalysisBaseCohortWarning).should("not.exist");
      cy.get(Locators.ModelOverviewChartPivot).should("exist");
      cy.get(Locators.ModelOverviewChartPivotItems).should("have.length", 1);
      cy.get(Locators.ModelOverviewProbabilityDistributionChart).should("not.exist");
      cy.get(Locators.ModelOverviewMetricChart).should("exist");
    });
  });
}
