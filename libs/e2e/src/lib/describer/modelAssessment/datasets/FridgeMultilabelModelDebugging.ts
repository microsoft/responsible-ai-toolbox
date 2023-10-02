// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const FridgeMultilabelModelDebugging = {
  causalAnalysisData: {
    hasCausalAnalysisComponent: false
  },
  checkDupCohort: false,
  cohortDefaultName: "All data",
  dataBalanceData: {
    aggregateBalanceMeasuresComputed: false,
    distributionBalanceMeasuresComputed: false,
    featureBalanceMeasuresComputed: false
  },
  errorAnalysisData: {
    hasErrorAnalysisComponent: true
  },
  featureImportanceData: {
    hasFeatureImportanceComponent: false
  },
  featureNames: ["image"],
  isImageMultiLabel: true,
  modelOverviewData: {
    featureCohortView: {
      firstFeatureToSelect: "mean_pixel_value",
      multiFeatureCohorts: 3,
      secondFeatureToSelect: "Make",
      singleFeatureCohorts: 3
    },
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          exactMatchRatio: "0.925",
          hammingScore: "0.729"
        },
        name: "All data",
        sampleSize: "10"
      }
    ],
    newCohort: {
      metrics: {
        exactMatchRatio: "1",
        hammingScore: "1"
      },
      name: "CohortCreateE2E-multilabel",
      sampleSize: "3"
    }
  },
  visionDataExplorerData: {
    errorInstances: 0,
    hasVisionDataExplorerComponent: true,
    successInstances: 10
  }
};
