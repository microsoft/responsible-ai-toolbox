// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const HousingRegression = {
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
  datasetExplorerData: {
    cohortDatasetNewValue: "100",
    colorValueButton: "Index",
    datasetBarLabel: [
      "0 - 145",
      "146 - 291",
      "292 - 437",
      "438 - 583",
      "584 - 729"
    ],
    defaultXAxis: "Index",
    defaultYAxis: "LotFrontage"
  },
  errorAnalysisData: {
    hasErrorAnalysisComponent: false
  },
  featureImportanceData: {
    hasFeatureImportanceComponent: false
  },
  featureNames: [
    "CRIM",
    "ZN",
    "INDUS",
    "CHAS",
    "NOX",
    "RM",
    "AGE",
    "DIS",
    "RAD",
    "TAX",
    "PTRATIO",
    "B",
    "LSTAT"
  ],
  isRegression: true,
  modelOverviewData: {
    featureCohortView: {
      firstFeatureToSelect: "CRIM",
      multiFeatureCohorts: 5,
      secondFeatureToSelect: "INDUS",
      singleFeatureCohorts: 3
    },
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          meanAbsoluteError: "272.585",
          meanPrediction: "21.849",
          meanSquaredError: "21.434"
        },
        name: "All data",
        sampleSize: "253"
      },
      {
        metrics: {
          meanAbsoluteError: "205.316",
          meanPrediction: "21.109",
          meanSquaredError: "8.724"
        },
        name: "Cohort True Y",
        sampleSize: "97"
      },
      {
        metrics: {
          meanAbsoluteError: "272.585",
          meanPrediction: "21.849",
          meanSquaredError: "21.434"
        },
        name: "Cohort Categorical",
        sampleSize: "102"
      },
      {
        metrics: {
          meanAbsoluteError: "145.608",
          meanPrediction: "17.79",
          meanSquaredError: "45.637"
        },
        name: "Cohort Continuous",
        sampleSize: "37"
      },
      {
        metrics: {
          meanAbsoluteError: "61.343",
          meanPrediction: "22.054",
          meanSquaredError: "31.62"
        },
        name: "Cohort Index",
        sampleSize: "23"
      },
      {
        metrics: {
          meanAbsoluteError: "48.918",
          meanPrediction: "25.541",
          meanSquaredError: "598.453"
        },
        name: "Cohort Regression Error",
        sampleSize: "2"
      },
      {
        metrics: {
          meanAbsoluteError: "32.532",
          meanPrediction: "37.099",
          meanSquaredError: "18.373"
        },
        name: "Cohort Predicted Y",
        sampleSize: "10"
      }
    ],
    newCohort: {
      metrics: {
        meanAbsoluteError: "269.864",
        meanPrediction: "22.005",
        meanSquaredError: "21.573"
      },
      name: "CohortCreateE2E-housing",
      sampleSize: "499"
    }
  },
  modelStatisticsData: {
    cohortDropDownValues: ["All data"],
    hasModelStatisticsComponent: false,
    hasSideBar: false
  },
  whatIfCounterfactualsData: {
    hasWhatIfCounterfactualsComponent: false
  }
};
