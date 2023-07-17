// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { getNumberOfCohorts } from "./numberOfCohorts";

export function ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent(
  datasetShape: IModelAssessmentData,
  includeNewCohort: boolean,
  isNotebookTest: boolean
): void {
  const data = datasetShape.modelOverviewData;
  const initialCohorts = data?.initialCohorts;
  cy.get(Locators.ModelOverviewFeatureSelection).should("not.exist");
  cy.get(Locators.ModelOverviewFeatureConfigurationActionButton).should(
    "not.exist"
  );
  if (isNotebookTest) {
    if (getNumberOfCohorts(datasetShape, includeNewCohort) <= 1) {
      cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should(
        "not.exist"
      );
    } else {
      cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should("exist");
    }
  }
  cy.get(Locators.ModelOverviewDatasetCohortStatsTable).should("exist");
  cy.get(Locators.ModelOverviewDisaggregatedAnalysisTable).should("not.exist");
  cy.get(Locators.ModelOverviewTableYAxisGrid).should(
    "include.text",
    initialCohorts?.[0].name
  );

  const metricsOrder: string[] = [];
  if (datasetShape.isObjectDetection) {
    metricsOrder.push(
      "meanAveragePrecision",
      "averagePrecision",
      "averageRecall"
    );
  } else if (datasetShape.isMultiLabel) {
    metricsOrder.push("exactMatchRatio", "hammingScore");
  } else if (datasetShape.isImageClassification) {
    metricsOrder.push(
      "accuracy",
      "f1Score",
      "precisionScore",
      "recallScore",
      "falsePositiveRate",
      "falseNegativeRate",
      "selectionRate"
    );
  }

  const heatmapCellContents: string[] = [];
  const cohorts = initialCohorts?.concat(
    includeNewCohort && data?.newCohort ? [data.newCohort] : []
  );
  cohorts?.forEach((cohortData) => {
    heatmapCellContents.push(cohortData.sampleSize);
  });
  metricsOrder.forEach((metricName) => {
    cohorts?.forEach((cohortData) => {
      heatmapCellContents.push(cohortData.metrics[metricName]);
    });
  });

  if (isNotebookTest) {
    cy.get(Locators.ModelOverviewHeatmapCells)
      .should("have.length", (cohorts?.length || 0) * (metricsOrder.length + 1))
      .each(($cell) => {
        // somehow the cell string is one invisible character longer, trim
        expect($cell.text().slice(0, $cell.text().length - 1)).to.be.oneOf(
          heatmapCellContents
        );
      });
  }

  cy.get(
    Locators.ModelOverviewDisaggregatedAnalysisBaseCohortDisclaimer
  ).should("not.exist");
  cy.get(Locators.ModelOverviewDisaggregatedAnalysisBaseCohortWarning).should(
    "not.exist"
  );
}
