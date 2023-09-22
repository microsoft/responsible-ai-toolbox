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
    hasErrorAnalysisComponent: true
  },
  featureImportanceData: {
    hasFeatureImportanceComponent: false
  },
  featureNames: ["image"],
  isImageClassification: true,
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
    ],
    newCohort: {
      metrics: {
        accuracy: "0.9",
        macroF1: "0.9",
        macroPrecision: "0.9",
        macroRecall: "0.9",
        microF1: "0.9",
        microPrecision: "0.9",
        microRecall: "0.9"
      },
      name: "CohortCreateE2E-image-classification",
      sampleSize: "5"
    }
  },
  visionDataExplorerData: {
    errorInstances: 0,
    hasVisionDataExplorerComponent: true,
    successInstances: 10
  }
};
