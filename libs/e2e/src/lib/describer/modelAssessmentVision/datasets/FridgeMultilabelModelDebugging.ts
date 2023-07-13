// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const FridgeMultilabelModelDebugging = {
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
  modelOverviewData: {
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
    ]
  }
};
