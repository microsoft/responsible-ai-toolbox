// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const DiabetesRegressionModelDebugging = {
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
  datasetExplorerData: {
    cohortDatasetNewValue: "0.05",
    colorValueButton: "Predicted Y",
    datasetBarLabel: ["0 - 17", "18 - 35", "36 - 52", "53 - 70", "71 - 88"],
    defaultXAxis: "Index",
    defaultYAxis: "age"
  },
  errorAnalysisData: {
    hasErrorAnalysisComponent: true
  },
  featureImportanceData: {
    datapoint: 89,
    dropdownRowName: "Row 4",
    hasCorrectIncorrectDatapoints: false,
    hasFeatureImportanceComponent: true,
    newFeatureDropdownValue: "bp",
    noDataset: false,
    noFeatureImportance: false,
    noLocalImportance: false,
    topFeaturesCurrentValue: "4",
    topFeaturesText: "Top 4 features by their importance"
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
    cohortDropDownValues: ["All data"],
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
    searchBarQuery: "s6",
    selectedDatapoint: "Index 1",
    whatIfNameLabel: "Copy of row 1",
    whatIfNameLabelUpdated: "New Copy of row 1",
    yAxisNewValue: "bmi",
    yAxisValue: "age"
  }
};
