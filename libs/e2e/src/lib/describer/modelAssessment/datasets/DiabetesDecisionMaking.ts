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
  checkDupCohort: true,
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
      firstFeatureToSelect: "s5",
      multiFeatureCohorts: 9,
      secondFeatureToSelect: "bp",
      singleFeatureCohorts: 3
    },
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          meanAbsoluteError: "43.324",
          meanPrediction: "154.043",
          meanSquaredError: "2 983.258"
        },
        name: "All data",
        sampleSize: "89"
      },
      {
        metrics: {
          meanAbsoluteError: "51.629",
          meanPrediction: "196.622",
          meanSquaredError: "4 018.715"
        },
        name: "Cohort Age and BMI",
        sampleSize: "38"
      },
      {
        metrics: {
          meanAbsoluteError: "49.167",
          meanPrediction: "142.495",
          meanSquaredError: "3 839.796"
        },
        name: "Cohort Index",
        sampleSize: "20"
      },
      {
        metrics: {
          meanAbsoluteError: "40.124",
          meanPrediction: "116.04",
          meanSquaredError: "2 374.166"
        },
        name: "Cohort Predicted Y",
        sampleSize: "52"
      },
      {
        metrics: {
          meanAbsoluteError: "42.988",
          meanPrediction: "155.229",
          meanSquaredError: "2 972.082"
        },
        name: "Cohort True Y",
        sampleSize: "87"
      },
      {
        metrics: {
          meanAbsoluteError: "57.108",
          meanPrediction: "157.322",
          meanSquaredError: "4 157.804"
        },
        name: "Cohort Regression Error",
        sampleSize: "63"
      }
    ],
    newCohort: {
      metrics: {
        meanAbsoluteError: "43.802",
        meanPrediction: "153.898",
        meanSquaredError: "3 017.141"
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
