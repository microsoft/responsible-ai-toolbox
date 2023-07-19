// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const FridgeImageClassificationModelDebugging = {
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
  isImageClassification: true,
  modelOverviewData: {
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          accuracy: "0.97",
          macroF1: "0.97",
          macroPrecision: "0.97",
          macroRecall: "0.97",
          microF1: "0.97",
          microPrecision: "0.97",
          microRecall: "0.97"
        },
        name: "All data",
        sampleSize: "134"
      }
    ]
  }
};
