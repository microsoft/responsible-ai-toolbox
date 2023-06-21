// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const HousingClassificationModelDebugging = {
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
    cohortDatasetNewValue: "150",
    colorValueButton: "Predicted Y",
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
    hasErrorAnalysisComponent: true
  },
  featureImportanceData: {
    avgOfAbsValue: "Average of absolute value",
    datapoint: 730,
    dropdownRowName: "Row 4",
    hasCorrectIncorrectDatapoints: true,
    hasFeatureImportanceComponent: true,
    newFeatureDropdownValue: "OverallQual",
    noDataset: false,
    noFeatureImportance: false,
    noLocalImportance: false,
    rowToSelect: "4",
    topFeaturesCurrentValue: "4",
    topFeaturesText: "Top 4 features by their importance"
  },
  featureNames: [
    "LotFrontage",
    "LotArea",
    "OverallQual",
    "OverallCond",
    "YearBuilt",
    "YearRemodAdd",
    "BsmtUnfSF",
    "TotalBsmtSF",
    "Ce0tralAir",
    "1stFlrSF",
    "2ndFlrSF",
    "LowQualFinSF",
    "GrLivArea",
    "BsmtFullBath",
    "BsmtHalfBath",
    "FullBath",
    "HalfBath",
    "BedroomAbvGr",
    "KitchenAbvGr",
    "TotRmsAbvGrd",
    "Fireplaces",
    "GarageYrBlt",
    "GarageCars",
    "GarageArea",
    "PavedDrive",
    "WoodDeckSF",
    "OpenPorchSF",
    "EnclosedPorch",
    "3SsnPorch",
    "ScreenPorch",
    "PoolArea",
    "YrSold"
  ],
  isBinary: true,
  modelOverviewData: {
    featureCohortView: {
      firstFeatureToSelect: "LotFrontage",
      multiFeatureCohorts: 7,
      secondFeatureToSelect: "OverallQual",
      singleFeatureCohorts: 3
    },
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          accuracy: "0.91",
          falseNegativeRate: "0.093",
          falsePositiveRate: "0.087",
          selectionRate: "0.496"
        },
        name: "All data",
        sampleSize: "730"
      }
    ],
    newCohort: {
      metrics: {
        accuracy: "0.911",
        falseNegativeRate: "0.093",
        falsePositiveRate: "0.085",
        selectionRate: "0.495"
      },
      name: "CohortCreateE2E-housing",
      sampleSize: "729"
    }
  },
  modelStatisticsData: {
    cohortDropDownValues: ["All data"],
    defaultXAxis: "Probability : Less than median",
    defaultXAxisPanelValue: "Prediction probabilities",
    defaultYAxis: "Cohort",
    hasModelStatisticsComponent: true,
    hasSideBar: true,
    xAxisNewValue: "Probability : Less than median",
    yAxisNewPanelValue: "Dataset",
    yAxisNewValue: "LotFrontage",
    yAxisNumberOfBins: "5"
  },
  whatIfCounterfactualsData: {
    checkForClassField: true,
    classValue: "Probability : Less than median",
    columnHeaderAfterSort: "OverallQual",
    columnHeaderBeforeSort: "LotFrontage",
    createYourOwnCounterfactualDecimalInput: "18.5",
    createYourOwnCounterfactualInputFieldUpdated: "25",
    hasWhatIfCounterfactualsComponent: true,
    newClassValue: "Probability : More than median",
    searchBarQuery: "Wood",
    selectedDatapoint: "Index 1",
    whatIfNameLabel: "Copy of row 1",
    whatIfNameLabelUpdated: "New Copy of row 1",
    yAxisNewValue: "1stFlrSF",
    yAxisValue: "LotFrontage"
  }
};
