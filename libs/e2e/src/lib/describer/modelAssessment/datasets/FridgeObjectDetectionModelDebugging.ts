// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getOS } from "../../../../util/getOS";

const FeatureCohorts = getOS() === "Linux" ? [2, 3] : 3;

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
  errorAnalysisData: {
    hasErrorAnalysisComponent: true
  },
  featureImportanceData: {
    hasFeatureImportanceComponent: false
  },
  featureNames: ["image"],
  isObjectDetection: true,
  modelOverviewData: {
    featureCohortView: {
      firstFeatureToSelect: "mean_pixel_value",
      multiFeatureCohorts: FeatureCohorts,
      secondFeatureToSelect: "Make",
      singleFeatureCohorts: FeatureCohorts
    },
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
