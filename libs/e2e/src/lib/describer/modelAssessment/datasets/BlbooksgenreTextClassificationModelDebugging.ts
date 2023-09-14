// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { textExplanationData } from "./BlbooksgenreTextExplanationData";

export const BlbooksgenreTextClassificationModelDebugging = {
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
      multiFeatureCohorts: 3,
      secondFeatureToSelect: "negative_words",
      singleFeatureCohorts: 3
    },
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          accuracy: "0.95",
          precision: "0.944",
          recall: "1"
        },
        name: "All data",
        sampleSize: "20"
      }
    ],
    newCohort: {
      metrics: {
        accuracy: "0.947",
        precision: "0.941",
        recall: "1"
      },
      name: "CohortCreateE2E-text-classification",
      sampleSize: "19"
    }
  },
  textExplanationData
};
