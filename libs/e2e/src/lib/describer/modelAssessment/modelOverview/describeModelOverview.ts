// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { multiSelectComboBox } from "../../../../util/comboBox";
import { createCohort } from "../../../../util/createCohort";
import { Locators } from "../Constants";
import {
  IModelAssessmentData,
  RAINotebookNames
} from "../IModelAssessmentData";
import { modelAssessmentDatasetsIncludingFlights } from "../modelAssessmentDatasets";

const testName = "Model Overview v2";

export function describeModelOverview(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasetsIncludingFlights,
  isNotebookTest = true
): void {
  describe(testName, () => {
    if (isNotebookTest) {
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
          datasetShape.featureNames?.[0] || "",
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
          datasetShape.featureNames?.[2] || ""
        );
        ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent(
          datasetShape,
          2
        );
      });

      it("should show new cohorts in charts", () => {
        ensureNewCohortsShowUpInCharts(datasetShape, isNotebookTest);
      });
    } else {
      it("should not have 'Model overview' component", () => {
        cy.get(Locators.ModelOverview).should("not.exist");
      });
    }
  });
}

function ensureAllModelOverviewBasicElementsArePresent(): void {
  cy.get(Locators.ModelOverviewHeader).should("exist");
  cy.get(Locators.ModelOverviewDescription).should("exist");
  cy.get(Locators.ModelOverviewCohortViewSelector).should("exist");
  // when there are 2 pivot items, with overflow, it will have a hidden overflow button, so the length is 3
  cy.get(Locators.ModelOverviewCohortViewSelectorButtons).should(
    "have.length",
    3
  );
  cy.get(Locators.ModelOverviewMetricSelection).should("exist");
}

function ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent(
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
    const numberOfCohorts =
      (initialCohorts?.length || 0) + (includeNewCohort ? 1 : 0);
    if (numberOfCohorts <= 1) {
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
  if (datasetShape.isRegression) {
    metricsOrder.push(
      "meanAbsoluteError",
      "meanSquaredError",
      "meanPrediction"
    );
  } else {
    metricsOrder.push("accuracy");
    if (!datasetShape.isMulticlass) {
      metricsOrder.push(
        "falsePositiveRate",
        "falseNegativeRate",
        "selectionRate"
      );
    }
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
  cy.get(Locators.ModelOverviewChartPivot).should("exist");

  if (datasetShape.isRegression || datasetShape.isMulticlass) {
    // when there are 1 pivot item, with overflow, it will have a hidden overflow button, so the length is 2
    cy.get(Locators.ModelOverviewChartPivotItems).should("have.length", 2);
    cy.get(Locators.ModelOverviewProbabilityDistributionChart).should(
      "not.exist"
    );
    cy.get(Locators.ModelOverviewMetricChart).should("exist");
    if (isNotebookTest) {
      cy.get(Locators.ModelOverviewMetricChartBars).should(
        "have.length",
        cohorts?.length
      );
      // check aria-label of bar chart - aria-label uses comma as delimiter
      // between digits for thousands instead of whitespace
      const displayedMetric =
        (datasetShape.isRegression
          ? initialCohorts?.[0].metrics.meanAbsoluteError
          : initialCohorts?.[0].metrics.accuracy) || "";
      const expectedAriaLabel =
        !datasetShape.isRegression && !datasetShape.isMulticlass
          ? `1. ${initialCohorts?.[0].name}, ${displayedMetric.replace(
              " ",
              ","
            )}.`
          : `${initialCohorts?.[0].name}, ${displayedMetric.replace(
              " ",
              ","
            )}. ${
              datasetShape.isRegression
                ? "Mean absolute error"
                : "Accuracy score"
            }.`;
      cy.get(Locators.ModelOverviewMetricChartBars)
        .first()
        .should("have.attr", "aria-label", expectedAriaLabel);
    }
  } else {
    cy.get(Locators.ModelOverviewChartPivotItems).should("have.length", 3);
    cy.get(Locators.ModelOverviewProbabilityDistributionChart).should("exist");
    cy.get(Locators.ModelOverviewMetricChart).should("not.exist");
  }
}

function ensureAllModelOverviewFeatureCohortsViewBasicElementsArePresent(
  isNotebookTest: boolean
): void {
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
  if (isNotebookTest) {
    cy.get(Locators.MissingParameterPlaceholder).should(
      "include.text",
      "Select features to generate the feature-based analysis."
    );
  }
}

function ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent(
  datasetShape: IModelAssessmentData,
  selectedFeatures: number
): void {
  cy.get(Locators.ModelOverviewFeatureSelection).should("exist");
  cy.get(Locators.ModelOverviewFeatureConfigurationActionButton).should(
    "exist"
  );
  cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should("exist");
  cy.get(Locators.ModelOverviewDatasetCohortStatsTable).should("not.exist");
  cy.get(Locators.ModelOverviewDisaggregatedAnalysisTable).should("exist");
  cy.get(Locators.ModelOverviewChartPivot).should("exist");
  const expectedNumberOfChartPivotItems =
    datasetShape.isRegression || datasetShape.isMulticlass ? 2 : 3;
  cy.get(Locators.ModelOverviewChartPivotItems).should(
    "have.length",
    expectedNumberOfChartPivotItems
  );
  if (datasetShape.isRegression || datasetShape.isMulticlass) {
    cy.get(Locators.ModelOverviewProbabilityDistributionChart).should(
      "not.exist"
    );
    cy.get(Locators.ModelOverviewMetricChart).should("exist");
    const featureCohortView = datasetShape.modelOverviewData?.featureCohortView;
    let expectedNumberOfCohorts = featureCohortView?.singleFeatureCohorts;
    if (selectedFeatures > 1) {
      expectedNumberOfCohorts = featureCohortView?.multiFeatureCohorts;
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

function ensureNewCohortsShowUpInCharts(
  datasetShape: IModelAssessmentData,
  isNotebookTest: boolean
): void {
  cy.get(Locators.ModelOverviewCohortViewDatasetCohortViewButton).click();
  ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent(
    datasetShape,
    false,
    isNotebookTest
  );
  createCohort(datasetShape.modelOverviewData?.newCohort?.name);
  ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent(
    datasetShape,
    true,
    isNotebookTest
  );
}
