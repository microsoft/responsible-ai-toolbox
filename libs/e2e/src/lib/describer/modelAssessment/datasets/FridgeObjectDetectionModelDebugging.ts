// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const FridgeObjectDetectionModelDebugging = {
  causalAnalysisData: {
    hasCausalAnalysisComponent: false
  },
  checkDupCohort: true,
  cohortDefaultName: "All data",
  dataBalanceData: {
    aggregateBalanceMeasuresComputed: false,
    distributionBalanceMeasuresComputed: false,
    featureBalanceMeasuresComputed: false
  },
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
    ]
  }
};
