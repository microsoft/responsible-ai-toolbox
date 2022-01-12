// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModelAssessmentData } from "./IModelAssessmentData";

const modelAssessmentDatasets = {
  ClassificationModelDebugging: {
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
    errorAnalysisData: {
      basicInformationData: {
        BasicInformation: ["Unsaved", "All data (2 filters)"],
        InstancesInBaseCohort: [
          "Total",
          "500",
          "Correct",
          "398",
          "Incorrect",
          "102"
        ],
        InstancesInTheSelectedCohort: [
          "Total",
          "500",
          "Correct",
          "398",
          "Incorrect",
          "102"
        ],
        "PredictionPath(filters)": [
          "marital-status in Married-civ-spouse",
          "age > 32.50"
        ]
      },
      defaultMetric: "Error rate",
      errorCoverage: "75.49%",
      errorRate: "41.40%",
      filterInfoOnBranch: [
        "marital-status == Married-civ-spouse",
        "age > 32.50"
      ],
      hoverNodeData: {
        Correct: "398",
        "Error coverage": "100.00%",
        "Error rate": "20.40%",
        Incorrect: "102"
      },
      metricList: [
        "Error rate",
        "Precision score",
        "Recall score",
        "F1 score",
        "Accuracy score"
      ],
      modelStatisticsData: {},
      nodeHeader: "77/186",
      nodeValuesOnMetricChange: {
        Correct: "186",
        "Error coverage": "75.49%",
        "Error rate": "0.18",
        Incorrect: "77.00",
        nodeValue: "0.18"
      }
    },
    featureImportanceData: {
      correctPredictionDatapoint: "398",
      datapoint: 500,
      dropdownRowName: "Row 4",
      hasCorrectIncorrectDatapoints: true,
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
      defaultXAxis: "Probability : <=50K",
      defaultXAxisPanelValue: "Prediction probabilities",
      defaultYAxis: "Cohort",
      yAxisNewPanelValue: "Dataset",
      yAxisNewValue: "age",
      yAxisNumberOfBins: "8"
    },
    whatIfCounterfactualsData: {
      checkForClassField: true,
      columnHeaderAfterSort: "capital-gain",
      columnHeaderBeforeSort: "age",
      CreateYourOwnCounterfactualInputFieldUpdated: "25",
      searchBarQuery: "occupation",
      selectedDatapoint: "Index 5",
      WhatIfNameLabel: "Copy of row 5",
      WhatIfNameLabelUpdated: "New Copy of row 5",
      yAxisNewValue: "occupation",
      yAxisValue: "age",
      classValue: "Probability : <=50K",
      newClassValue: "Probability : >50K"
    }
  },
  DiabetesRegressionModelDebugging: {
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
      defaultXAxis: "Error",
      defaultXAxisPanelValue: "Error",
      defaultYAxis: "Cohort",
      yAxisNewPanelValue: "Dataset",
      yAxisNewValue: "age",
      yAxisNumberOfBins: "8"
    },
    whatIfCounterfactualsData: {
      checkForClassField: false,
      columnHeaderAfterSort: "s5",
      columnHeaderBeforeSort: "age",
      CreateYourOwnCounterfactualInputFieldUpdated: "25",
      searchBarQuery: "s6",
      selectedDatapoint: "Index 5",
      WhatIfNameLabel: "Copy of row 5",
      WhatIfNameLabelUpdated: "New Copy of row 5",
      yAxisNewValue: "bmi",
      yAxisValue: "age"
    }
  },
  HousingClassificationModelDebugging: {
    cohortDefaultName: "All data",
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
    featureImportanceData: {
      datapoint: 730,
      dropdownRowName: "Row 4",
      hasCorrectIncorrectDatapoints: false,
      newFeatureDropdownValue: "OverallQual",
      noDataset: false,
      noFeatureImportance: false,
      noLocalImportance: false,
      topFeaturesCurrentValue: "4",
      topFeaturesText: "Top 4 features by their importance"
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
    whatIfCounterfactualsData: {
      checkForClassField: true,
      columnHeaderAfterSort: "OverallQual",
      columnHeaderBeforeSort: "LotFrontage",
      CreateYourOwnCounterfactualInputFieldUpdated: "25",
      searchBarQuery: "Wood",
      selectedDatapoint: "Index 5",
      WhatIfNameLabel: "Copy of row 5",
      WhatIfNameLabelUpdated: "New Copy of row 5",
      yAxisNewValue: "1stFlrSF",
      yAxisValue: "LotFrontage",
      newClassValue: "Probability : More than median",
      classValue: "Probability : Less than median"
    }
  }
};

const withType: {
  [key in keyof typeof modelAssessmentDatasets]: IModelAssessmentData;
} = modelAssessmentDatasets;

export { withType as modelAssessmentDatasets };
