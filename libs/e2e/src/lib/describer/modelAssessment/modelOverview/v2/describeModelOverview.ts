// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { multiSelectComboBox } from "../../../../../util/comboBox";
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
      ensureAllModelOverviewBasicElementsArePresent();
      ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent(
        datasetShape
      );
    });

    it("should show 'Feature cohorts' view when selected", () => {
      ensureAllModelOverviewBasicElementsArePresent();
      cy.get(Locators.ModelOverviewCohortViewFeatureCohortViewButton).click();
      ensureAllModelOverviewFeatureCohortsViewBasicElementsArePresent();
      multiSelectComboBox(
        "#modelOverviewFeatureSelection",
        datasetShape.featureNames![0],
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
        datasetShape.featureNames![2]
      );
      ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent(
        datasetShape,
        2
      );
    });
  });
}

function ensureAllModelOverviewBasicElementsArePresent() {
  cy.get(Locators.ModelOverviewHeader).should("exist");
  cy.get(Locators.ModelOverviewDescription).should("exist");
  cy.get(Locators.ModelOverviewCohortViewSelector).should("exist");
  cy.get(Locators.ModelOverviewCohortViewSelectorButtons).should(
    "have.length",
    2
  );
  cy.get(Locators.ModelOverviewMetricSelection).should("exist");
}

function ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent(
  datasetShape: IModelAssessmentData
) {
  const data = datasetShape.modelOverviewData!;
  cy.get(Locators.ModelOverviewFeatureSelection).should("not.exist");
  cy.get(Locators.ModelOverviewFeatureConfigurationActionButton).should(
    "not.exist"
  );
  if (data.initialCohorts.length <= 1) {
    cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should(
      "not.exist"
    );
  } else {
    cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should("exist");
  }
  cy.get(Locators.ModelOverviewDatasetCohortStatsTable).should("exist");
  cy.get(Locators.ModelOverviewDisaggregatedAnalysisTable).should("not.exist");
  cy.get(Locators.ModelOverviewTableYAxisGrid).should(
    "include.text",
    data.initialCohorts[0].name
  );

  let metricsOrder: string[] = [];
  if (datasetShape.isRegression) {
    metricsOrder.push(
      "meanAbsoluteError",
      "meanSquaredError",
      "meanPrediction"
    );
  } else {
    metricsOrder.push(
      "accuracy",
      "falsePositiveRate",
      "falseNegativeRate",
      "selectionRate"
    );
  }

  let heatmapCellOrder: string[] = [];
  data.initialCohorts.forEach((cohortData) => {
    heatmapCellOrder.push(cohortData.sampleSize);
  });
  metricsOrder.forEach((metricName) => {
    data.initialCohorts.forEach((cohortData) => {
      heatmapCellOrder.push(cohortData.metrics[metricName]);
    });
  });

  heatmapCellOrder.forEach((expectedCellContent, cellIndex) => {
    let cell = cy.get(Locators.ModelOverviewHeatmapCells).first();
    for (
      var currentCellIndex = 0;
      currentCellIndex < cellIndex;
      currentCellIndex += 1
    ) {
      cell = cell.next();
    }
    cell.should("include.text", expectedCellContent);
  });
  cy.get(
    Locators.ModelOverviewDisaggregatedAnalysisBaseCohortDisclaimer
  ).should("not.exist");
  cy.get(Locators.ModelOverviewDisaggregatedAnalysisBaseCohortWarning).should(
    "not.exist"
  );
  cy.get(Locators.ModelOverviewChartPivot).should("exist");

  if (datasetShape.isRegression || datasetShape.isMulticlass) {
    cy.get(Locators.ModelOverviewChartPivotItems).should("have.length", 1);
    cy.get(Locators.ModelOverviewProbabilityDistributionChart).should(
      "not.exist"
    );
    cy.get(Locators.ModelOverviewMetricChart).should("exist");
    cy.get(Locators.ModelOverviewMetricChartBars).should(
      "have.length",
      data.initialCohorts.length
    );
    // check aria-label of bar chart - aria-label uses comma as delimiter
    // between digits for thousands instead of whitespace
    const displayedMetric = datasetShape.isRegression
      ? data.initialCohorts[0].metrics.meanAbsoluteError
      : data.initialCohorts[0].metrics.accuracy;
    cy.get(Locators.ModelOverviewMetricChartBars)
      .first()
      .should(
        "have.attr",
        "aria-label",
        `1. ${
          datasetShape.modelOverviewData?.initialCohorts[0].name
        }, ${displayedMetric.replace(" ", ",")}.`
      );
  } else {
    cy.get(Locators.ModelOverviewChartPivotItems).should("have.length", 2);
    cy.get(Locators.ModelOverviewProbabilityDistributionChart).should("exist");
    cy.get(Locators.ModelOverviewMetricChart).should("not.exist");
  }
}

function ensureAllModelOverviewFeatureCohortsViewBasicElementsArePresent() {
  cy.get(Locators.ModelOverviewFeatureSelection).should("exist");
  cy.get(Locators.ModelOverviewFeatureConfigurationActionButton).should(
    "exist"
  );
  cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should("not.exist");
  cy.get(Locators.ModelOverviewDatasetCohortStatsTable).should("not.exist");
  cy.get(Locators.ModelOverviewDisaggregatedAnalysisTable).should("not.exist");
  //cy.get(Locators.ModelOverviewTableYAxisGrid).should("not.exit");
  cy.get(Locators.ModelOverviewHeatmapCells).should("not.exist");
  cy.get(
    Locators.ModelOverviewDisaggregatedAnalysisBaseCohortDisclaimer
  ).should("not.exist");
  cy.get(Locators.ModelOverviewDisaggregatedAnalysisBaseCohortWarning).should(
    "not.exist"
  );
  cy.get(Locators.ModelOverviewChartPivot).should("not.exist");
  cy.get(Locators.ModelOverviewProbabilityDistributionChart).should(
    "not.exist"
  );
  cy.get(Locators.ModelOverviewMetricChart).should("not.exist");
  cy.get(Locators.MissingParameterPlaceholder).should(
    "include.text",
    "Select features to generate the feature-based analysis."
  );
}

function ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent(
  datasetShape: IModelAssessmentData,
  selectedFeatures: number
) {
  cy.get(Locators.ModelOverviewFeatureSelection).should("exist");
  cy.get(Locators.ModelOverviewFeatureConfigurationActionButton).should(
    "exist"
  );
  cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should("exist");
  cy.get(Locators.ModelOverviewDatasetCohortStatsTable).should("not.exist");
  cy.get(Locators.ModelOverviewDisaggregatedAnalysisTable).should("exist");
  cy.get(Locators.ModelOverviewChartPivot).should("exist");
  const expectedNumberOfChartPivotItems =
    datasetShape.isRegression || datasetShape.isMulticlass ? 1 : 2;
  cy.get(Locators.ModelOverviewChartPivotItems).should(
    "have.length",
    expectedNumberOfChartPivotItems
  );
  if (datasetShape.isRegression || datasetShape.isMulticlass) {
    cy.get(Locators.ModelOverviewProbabilityDistributionChart).should(
      "not.exist"
    );
    cy.get(Locators.ModelOverviewMetricChart).should("exist");
    let expectedNumberOfCohorts =
      datasetShape.modelOverviewData?.featureCohortView.singleFeatureCohorts;
    if (selectedFeatures > 1) {
      expectedNumberOfCohorts =
        datasetShape.modelOverviewData?.featureCohortView.multiFeatureCohorts;
    }
    cy.get(Locators.ModelOverviewMetricChartBars).should(
      "have.length",
      expectedNumberOfCohorts
    );
  } else {
    cy.get(Locators.ModelOverviewProbabilityDistributionChart).should("exist");
    cy.get(Locators.ModelOverviewMetricChart).should("not.exist");
  }
}
