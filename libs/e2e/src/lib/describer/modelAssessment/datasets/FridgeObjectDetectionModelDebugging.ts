// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const FridgeObjectDetectionModelDebugging = {
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
  // TODO: switch to true after EA support
  errorAnalysisData: {
    hasErrorAnalysisComponent: false
  },
  featureImportanceData: {
    hasFeatureImportanceComponent: false
  },
  featureNames: ["image"],
  isObjectDetection: true,
  modelOverviewData: {
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          averagePrecision: "N/A",
          averageRecall: "N/A",
          meanAveragePrecision: "N/A"
        },
        name: "All data",
        sampleSize: "5"
      }
    ],
    newCohort: {
      metrics: {
        averagePrecision: "1",
        averageRecall: "1",
        meanAveragePrecision: "1"
      },
      name: "CohortCreateE2E-object-detection",
      sampleSize: "2"
    }
  },
  visionDataExplorerData: {
    errorInstances: 0,
    hasVisionDataExplorerComponent: true,
    successInstances: 5
  }
};
