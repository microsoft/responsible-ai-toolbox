// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModelAssessmentData } from "./IModelAssessmentData";

const modelAssessmentDatasets = {
  ClassificationModelDebugging: {
    causalAnalysisData: {
      hasCausalAnalysisComponent: false
    },
    cohortDefaultName: "All data",
    datasetExplorerData: {
      cohortDatasetNewValue: "40",
      colorValueButton: "Predicted Y",
      datasetBarLabel: [
        "0 - 99",
        "100 - 199",
        "200 - 299",
        "300 - 399",
        "400 - 499"
      ],
      defaultXAxis: "Index",
      defaultYAxis: "age"
    },
    featureImportanceData: {
      correctPredictionDatapoint: "398",
      datapoint: 500,
      dropdownRowName: "Row 4",
      hasCorrectIncorrectDatapoints: true,
      hasFeatureImportanceComponent: true,
      incorrectPredictionDatapoint: "102",
      newFeatureDropdownValue: "workclass",
      noDataset: false,
      noFeatureImportance: false,
      noLocalImportance: false,
      topFeaturesCurrentValue: "4",
      topFeaturesText: "Top 4 features by their importance"
    },
    featureNames: [
      "marital-status",
      "education-num",
      "capital-gain",
      "age",
      "hours-per-week",
      "relationship",
      "occupation",
      "workclass",
      "native-country",
      "fnlwgt",
      "race",
      "gender",
      "education",
      "capital-loss"
    ],
    modelStatisticsData: {
      hasModelStatisticsComponent: true,
      hasSideBar: true,
      defaultXAxis: "Probability : <=50K",
      defaultXAxisPanelValue: "Prediction probabilities",
      defaultYAxis: "Cohort",
      yAxisNewPanelValue: "Dataset",
      yAxisNewValue: "age",
      yAxisNumberOfBins: "8",
      xAxisNewValue: "Probability : <=50K"
    },
    whatIfCounterfactualsData: {
      hasWhatIfCounterfactualsComponent: true,
      checkForClassField: true,
      classValue: "Probability : <=50K",
      columnHeaderAfterSort: "capital-gain",
      columnHeaderBeforeSort: "age",
      createYourOwnCounterfactualInputFieldUpdated: "25",
      newClassValue: "Probability : >50K",
      searchBarQuery: "occupation",
      selectedDatapoint: "Index 5",
      whatIfNameLabel: "Copy of row 5",
      whatIfNameLabelUpdated: "New Copy of row 5",
      yAxisNewValue: "occupation",
      yAxisValue: "age"
    }
  },
  DiabetesDecisionMaking: {
    causalAnalysisData: {
      featureListInCausalTable: ["s2(num)", "bmi(num)", "bp(num)"],
      hasCausalAnalysisComponent: true
    },
    cohortDefaultName: "All data",
    datasetExplorerData: {
      cohortDatasetNewValue: "0.05",
      colorValueButton: "Predicted Y",
      datasetBarLabel: ["0 - 17", "18 - 35", "36 - 52", "53 - 70", "71 - 88"],
      defaultXAxis: "Index",
      defaultYAxis: "age"
    },
    featureImportanceData: {
      datapoint: 89,
      hasFeatureImportanceComponent: false
    },
    featureNames: [
      "s5",
      "bmi",
      "bp",
      "s3",
      "sex",
      "s1",
      "s4",
      "s2",
      "age",
      "s6"
    ],
    modelStatisticsData: {
      hasModelStatisticsComponent: true,
      hasSideBar: true,
      defaultXAxis: "Error",
      defaultXAxisPanelValue: "Error",
      defaultYAxis: "Cohort",
      yAxisNewPanelValue: "Dataset",
      yAxisNewValue: "age",
      yAxisNumberOfBins: "8",
      xAxisNewValue: "Error"
    },
    whatIfCounterfactualsData: {
      hasWhatIfCounterfactualsComponent: true,
      checkForClassField: false,
      columnHeaderAfterSort: "s5",
      columnHeaderBeforeSort: "age",
      createYourOwnCounterfactualInputFieldUpdated: "25",
      searchBarQuery: "sex",
      selectedDatapoint: "Index 5",
      whatIfNameLabel: "Copy of row 5",
      whatIfNameLabelUpdated: "New Copy of row 5",
      yAxisNewValue: "s3",
      yAxisValue: "age"
    }
  },
  DiabetesRegressionModelDebugging: {
    causalAnalysisData: {
      hasCausalAnalysisComponent: false
    },
    cohortDefaultName: "All data",
    datasetExplorerData: {
      cohortDatasetNewValue: "0.05",
      colorValueButton: "Predicted Y",
      datasetBarLabel: ["0 - 17", "18 - 35", "36 - 52", "53 - 70", "71 - 88"],
      defaultXAxis: "Index",
      defaultYAxis: "age"
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
    featureNames: [
      "s5",
      "bmi",
      "bp",
      "s3",
      "sex",
      "s1",
      "s4",
      "s2",
      "age",
      "s6"
    ],
    modelStatisticsData: {
      hasModelStatisticsComponent: true,
      hasSideBar: true,
      defaultXAxis: "Error",
      defaultXAxisPanelValue: "Error",
      defaultYAxis: "Cohort",
      yAxisNewPanelValue: "Dataset",
      yAxisNewValue: "age",
      yAxisNumberOfBins: "8",
      xAxisNewValue: "Error"
    },
    whatIfCounterfactualsData: {
      hasWhatIfCounterfactualsComponent: true,
      checkForClassField: false,
      columnHeaderAfterSort: "s5",
      columnHeaderBeforeSort: "age",
      createYourOwnCounterfactualInputFieldUpdated: "25",
      searchBarQuery: "s6",
      selectedDatapoint: "Index 5",
      whatIfNameLabel: "Copy of row 5",
      whatIfNameLabelUpdated: "New Copy of row 5",
      yAxisNewValue: "bmi",
      yAxisValue: "age"
    }
  },
  HousingClassificationModelDebugging: {
    causalAnalysisData: {
      hasCausalAnalysisComponent: false
    },
    cohortDefaultName: "All data",
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
    featureImportanceData: {
      datapoint: 730,
      dropdownRowName: "Row 4",
      hasCorrectIncorrectDatapoints: false,
      hasFeatureImportanceComponent: true,
      newFeatureDropdownValue: "OverallQual",
      noDataset: false,
      noFeatureImportance: false,
      noLocalImportance: false,
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
    modelStatisticsData: {
      hasModelStatisticsComponent: true,
      hasSideBar: true,
      defaultXAxis: "Probability : Less than median",
      defaultXAxisPanelValue: "Prediction probabilities",
      defaultYAxis: "Cohort",
      yAxisNewPanelValue: "Dataset",
      yAxisNewValue: "LotFrontage",
      yAxisNumberOfBins: "8",
      xAxisNewValue: "Probability : Less than median"
    },
    whatIfCounterfactualsData: {
      hasWhatIfCounterfactualsComponent: true,
      checkForClassField: true,
      classValue: "Probability : Less than median",
      columnHeaderAfterSort: "OverallQual",
      columnHeaderBeforeSort: "LotFrontage",
      createYourOwnCounterfactualInputFieldUpdated: "25",
      newClassValue: "Probability : More than median",
      searchBarQuery: "Wood",
      selectedDatapoint: "Index 5",
      whatIfNameLabel: "Copy of row 5",
      whatIfNameLabelUpdated: "New Copy of row 5",
      yAxisNewValue: "1stFlrSF",
      yAxisValue: "LotFrontage"
    }
  },
  HousingDecisionMaking: {
    cohortDefaultName: "All data",
    featureImportanceData: {
      hasFeatureImportanceComponent: false
    },
    causalAnalysisData: {
      featureListInCausalTable: [
        "GarageCars(num)",
        "OverallQual(num)",
        "Fireplaces(num)",
        "OverallCond(num)",
        "ScreenPorch(num)"
      ],
      hasCausalAnalysisComponent: true
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
    modelStatisticsData: {
      hasModelStatisticsComponent: false,
      hasSideBar: false
    },
    whatIfCounterfactualsData: {
      hasWhatIfCounterfactualsComponent: false
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
    ]
  },
  MulticlassDnnModelDebugging: {
    isMulticlass: true,
    cohortDefaultName: "All data",
    featureImportanceData: {
      correctPredictionDatapoint: "60",
      datapoint: 500,
      dropdownRowName: "Row 24",
      hasCorrectIncorrectDatapoints: true,
      hasFeatureImportanceComponent: true,
      incorrectPredictionDatapoint: "29",
      newFeatureDropdownValue: "ash",
      noDataset: false,
      noFeatureImportance: false,
      noLocalImportance: false,
      topFeaturesCurrentValue: "4",
      topFeaturesText: "Top 4 features by their importance",
      rowToSelect: "24"
    },
    featureNames: [
      "total_phenols",
      "proline",
      "hue",
      "alcohol",
      "proanthocyanins",
      "od280/od315_of_diluted_wines",
      "malic_acid",
      "ash",
      "alcalinity_of_ash",
      "magnesium",
      "flavanoids",
      "nonflavanoid_phenols",
      "color_intensity"
    ],
    causalAnalysisData: {
      hasCausalAnalysisComponent: false
    },
    datasetExplorerData: {
      cohortDatasetNewValue: "14.5",
      colorValueButton: "Predicted Y",
      datasetBarLabel: ["0 - 17", "18 - 35", "36 - 52", "53 - 70", "71 - 88"],
      defaultXAxis: "Index",
      defaultYAxis: "alcohol"
    },
    modelStatisticsData: {
      hasModelStatisticsComponent: true,
      hasSideBar: false,
      defaultXAxis: "Predicted Y",
      defaultXAxisPanelValue: "Prediction probabilities",
      defaultYAxis: "Cohort",
      yAxisNewPanelValue: "Dataset",
      yAxisNewValue: "alcohol",
      yAxisNumberOfBins: "8",
      xAxisNewValue: "Probability : 0"
    },
    whatIfCounterfactualsData: {
      hasWhatIfCounterfactualsComponent: false
    }
  }
};

const withType: {
  [key in keyof typeof modelAssessmentDatasets]: IModelAssessmentData;
} = modelAssessmentDatasets;

export { withType as modelAssessmentDatasets };
