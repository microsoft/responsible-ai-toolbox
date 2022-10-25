// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const HousingDecisionMaking = {
  causalAnalysisData: {
    binaryDescription:
      "On average in this sample, turning on this feature will cause the predictions of the target to increase/decrease by X units.",
    continuousDescription:
      "On average in this sample, increasing this feature by 1 unit will cause the predictions of the target to increase/decrease by X units.",
    featureListInCausalTable: [
      "GarageCars(num)",
      "OverallQual(num)",
      "Fireplaces(num)",
      "OverallCond(num)",
      "ScreenPorch(num)"
    ],
    hasCausalAnalysisComponent: true
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
  modelOverviewData: {
    hasModelOverviewComponent: false
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
