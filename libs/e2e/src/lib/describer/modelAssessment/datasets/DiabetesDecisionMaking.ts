// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const DiabetesDecisionMaking = {
  causalAnalysisData: {
    binaryDescription:
      "On average in this sample, turning on this feature will cause the predictions of the target to increase/decrease by X units.",
    continuousDescription:
      "On average in this sample, increasing this feature by 1 unit will cause the predictions of the target to increase/decrease by X units.",
    featureListInCausalTable: ["s2(num)", "bmi(num)", "bp(num)"],
    hasCausalAnalysisComponent: true
  },
  cohortDefaultName: "All data",
  dataBalanceData: {
    aggregateBalanceMeasuresComputed: false,
    distributionBalanceMeasuresComputed: false,
    featureBalanceMeasuresComputed: false
  },
  datasetExplorerData: {
    cohortDatasetNewValue: "0.05",
    colorValueButton: "Predicted Y",
    datasetBarLabel: ["0 - 17", "18 - 35", "36 - 52", "53 - 70", "71 - 88"],
    defaultXAxis: "Index",
    defaultYAxis: "age"
  },
  errorAnalysisData: {
    hasErrorAnalysisComponent: false
  },
  featureImportanceData: {
    datapoint: 89,
    hasFeatureImportanceComponent: false
  },
  featureNames: ["s5", "bmi", "bp", "s3", "sex", "s1", "s4", "s2", "age", "s6"],
  isRegression: true,
  modelOverviewData: {
    featureCohortView: {
      multiFeatureCohorts: 9,
      singleFeatureCohorts: 3
    },
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          meanAbsoluteError: "3 859.27",
          meanPrediction: "154.102",
          meanSquaredError: "2 981.101"
        },
        name: "All data",
        sampleSize: "89"
      },
      {
        metrics: {
          meanAbsoluteError: "1 961.23",
          meanPrediction: "196.629",
          meanSquaredError: "4 014.697"
        },
        name: "Cohort Age and BMI",
        sampleSize: "38"
      },
      {
        metrics: {
          meanAbsoluteError: "983.52",
          meanPrediction: "142.495",
          meanSquaredError: "3 829.201"
        },
        name: "Cohort Index",
        sampleSize: "20"
      },
      {
        metrics: {
          meanAbsoluteError: "2 084.21",
          meanPrediction: "115.086",
          meanSquaredError: "2 416.75"
        },
        name: "Cohort Predicted Y",
        sampleSize: "51"
      },
      {
        metrics: {
          meanAbsoluteError: "3 744.86",
          meanPrediction: "155.306",
          meanSquaredError: "2 972.126"
        },
        name: "Cohort True Y",
        sampleSize: "87"
      },
      {
        metrics: {
          meanAbsoluteError: "3 597.63",
          meanPrediction: "157.301",
          meanSquaredError: "4 154.723"
        },
        name: "Cohort Regression Error",
        sampleSize: "63"
      }
    ],
    newCohort: {
      metrics: {
        meanAbsoluteError: "3 858.02",
        meanPrediction: "153.958",
        meanSquaredError: "3 014.96"
      },
      name: "CohortCreateE2E-diabetes",
      sampleSize: "88"
    }
  },
  modelStatisticsData: {
    cohortDropDownValues: [
      "All data",
      "Cohort Index",
      "Cohort Predicted Y",
      "Cohort True Y",
      "Cohort Regression Error",
      "Cohort Age and BMI"
    ],
    defaultXAxis: "Error",
    defaultXAxisPanelValue: "Error",
    defaultYAxis: "Cohort",
    hasModelStatisticsComponent: true,
    hasSideBar: true,
    xAxisNewValue: "Error",
    yAxisNewPanelValue: "Dataset",
    yAxisNewValue: "age",
    yAxisNumberOfBins: "5"
  },
  whatIfCounterfactualsData: {
    checkForClassField: false,
    columnHeaderAfterSort: "s5",
    columnHeaderBeforeSort: "age",
    createYourOwnCounterfactualDecimalInput: "18.5",
    createYourOwnCounterfactualInputFieldUpdated: "25",
    hasWhatIfCounterfactualsComponent: true,
    searchBarQuery: "sex",
    selectedDatapoint: "Index 1",
    whatIfNameLabel: "Copy of row 1",
    whatIfNameLabelUpdated: "New Copy of row 1",
    yAxisNewValue: "s3",
    yAxisValue: "age"
  }
};
