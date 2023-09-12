// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { textExplanationData } from "./DBPediaTextExplanationData";

export const DBPediaTextClassificationModelDebugging = {
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
  featureNames: ["text"],
  isTextClassification: true,
  modelOverviewData: {
    featureCohortView: {
      firstFeatureToSelect: "positive_words",
      multiFeatureCohorts: 7,
      secondFeatureToSelect: "negative_words",
      singleFeatureCohorts: 3
    },
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          accuracy: "0.6",
          macroF1: "0.649",
          macroPrecision: "0.625",
          macroRecall: "0.675"
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
        macroRecall: "0.9"
      },
      name: "CohortCreateE2E-text-classification",
      sampleSize: "5"
    }
  },
  textExplanationData
};
