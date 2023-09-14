// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { textExplanationData } from "./CovidTextExplanationData";

export const CovidTextClassificationModelDebugging = {
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
  featureNames: ["text"],
  isTextMultiLabel: true,
  modelOverviewData: {
    featureCohortView: {
      firstFeatureToSelect: "positive_words",
      multiFeatureCohorts: 3,
      secondFeatureToSelect: "negative_words",
      singleFeatureCohorts: 3
    },
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          exactMatchRatio: "0.958",
          hammingScore: "0.333"
        },
        name: "All data",
        sampleSize: "3"
      }
    ],
    newCohort: {
      metrics: {
        exactMatchRatio: "1",
        hammingScore: "0.375"
      },
      name: "CohortCreateE2E-multilabel-text",
      sampleSize: "2"
    }
  },
  textExplanationData
};
