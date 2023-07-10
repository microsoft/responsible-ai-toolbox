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
    modelOverviewData: {
      hasModelOverviewComponent: true,
      initialCohorts: [
        {
          metrics: {
            meanAveragePrecision: "N/A",
            averagePrecision: "N/A",
            averageRecall: "N/A"
          },
          name: "All data",
          sampleSize: "5"
        }
      ]
    }
  };
  