// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";

import { IModelAssessmentData } from "./IModelAssessmentData";

export const regExForNumbersWithBrackets = /^\((\d+)\)$/; // Ex: (60)

const modelAssessmentDatasets: { [name: string]: IModelAssessmentData } = {
  CensusClassificationModelDebugging: {
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
    errorAnalysisData: {
      hasErrorAnalysisComponent: true
    },
    featureImportanceData: {
      datapoint: 500,
      dropdownRowName: "Row 34",
      hasCorrectIncorrectDatapoints: true,
      hasFeatureImportanceComponent: true,
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
      cohortDropDownValues: [
        "All data",
        "Cohort Age and Hours-Per-Week",
        "Cohort Marital-Status",
        "Cohort Index",
        "Cohort Predicted Y",
        "Cohort True Y"
      ],
      defaultXAxis: "Probability : <=50K",
      defaultXAxisPanelValue: "Prediction probabilities",
      defaultYAxis: "Cohort",
      hasModelStatisticsComponent: true,
      hasSideBar: true,
      xAxisNewValue: "Probability : <=50K",
      yAxisNewPanelValue: "Dataset",
      yAxisNewValue: "age",
      yAxisNumberOfBins: "5"
    },
    whatIfCounterfactualsData: {
      checkForClassField: true,
      classValue: "Probability : <=50K",
      columnHeaderAfterSort: "capital-gain",
      columnHeaderBeforeSort: "age",
      createYourOwnCounterfactualDecimalInput: "18.5",
      createYourOwnCounterfactualInputFieldUpdated: "25",
      hasWhatIfCounterfactualsComponent: true,
      newClassValue: "Probability : >50K",
      searchBarQuery: "occupation",
      selectedDatapoint: "Index 1",
      whatIfNameLabel: "Copy of row 1",
      whatIfNameLabelUpdated: "New Copy of row 1",
      yAxisNewValue: "occupation",
      yAxisValue: "age"
    }
  },
  DiabetesDecisionMaking: {
    causalAnalysisData: {
      binaryDescription:
        "On average in this sample, turning on this feature will cause the predictions of the target to increase/decrease by X units.",
      continuousDescription:
        "On average in this sample, increasing this feature by 1 unit will cause the predictions of the target to increase/decrease by X units.",
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
    errorAnalysisData: {
      hasErrorAnalysisComponent: false
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
    isRegression: true,
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
    isRegression: true,
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
    errorAnalysisData: {
      hasErrorAnalysisComponent: true
    },
    featureImportanceData: {
      datapoint: 730,
      dropdownRowName: "Row 84",
      hasCorrectIncorrectDatapoints: true,
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
  },
  HousingDecisionMaking: {
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
    cohortDefaultName: "All data",
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
    modelStatisticsData: {
      cohortDropDownValues: ["All data"],
      hasModelStatisticsComponent: false,
      hasSideBar: false
    },
    whatIfCounterfactualsData: {
      hasWhatIfCounterfactualsComponent: false
    }
  },
  MulticlassDnnModelDebugging: {
    causalAnalysisData: {
      hasCausalAnalysisComponent: false
    },
    cohortDefaultName: "All data",
    datasetExplorerData: {
      cohortDatasetNewValue: "14.5",
      colorValueButton: "Predicted Y",
      datasetBarLabel: ["0 - 17", "18 - 35", "36 - 52", "53 - 70", "71 - 88"],
      defaultXAxis: "Index",
      defaultYAxis: "alcohol"
    },
    errorAnalysisData: {
      hasErrorAnalysisComponent: true
    },
    featureImportanceData: {
      datapoint: 500,
      dropdownRowName: "Row 24",
      hasCorrectIncorrectDatapoints: true,
      hasFeatureImportanceComponent: true,
      newFeatureDropdownValue: "ash",
      noDataset: false,
      noFeatureImportance: false,
      noLocalImportance: false,
      rowToSelect: "24",
      topFeaturesCurrentValue: "4",
      topFeaturesText: "Top 4 features by their importance"
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
    isMulticlass: true,
    modelStatisticsData: {
      cohortDropDownValues: ["All data"],
      defaultXAxis: "Predicted Y",
      defaultXAxisPanelValue: "Prediction probabilities",
      defaultYAxis: "Cohort",
      hasModelStatisticsComponent: true,
      hasSideBar: false,
      xAxisNewValue: "Probability : 0",
      yAxisNewPanelValue: "Dataset",
      yAxisNewValue: "alcohol",
      yAxisNumberOfBins: "5"
    },
    whatIfCounterfactualsData: {
      hasWhatIfCounterfactualsComponent: false
    }
  }
};

// create copy for newModelOverviewExperience to allow for additions and changes
const modelAssessmentDatasetsNewModelOverviewExperience: {
  [name: string]: IModelAssessmentData;
} = _.chain(modelAssessmentDatasets)
  .cloneDeep()
  .mapKeys((_v, k: string) => `${k}NewModelOverviewExperience`)
  .value();

modelAssessmentDatasetsNewModelOverviewExperience.CensusClassificationModelDebuggingNewModelOverviewExperience.modelOverviewData =
  {
    featureCohortView: {
      multiFeatureCohorts: 9,
      singleFeatureCohorts: 3
    },
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          accuracy: "0.856",
          falseNegativeRate: "0.35",
          falsePositiveRate: "0.077",
          selectionRate: "0.246"
        },
        name: "All data",
        sampleSize: "500"
      },
      {
        metrics: {
          accuracy: "0.753",
          falseNegativeRate: "0.313",
          falsePositiveRate: "0.195",
          selectionRate: "0.438"
        },
        name: "Cohort Age and Hours-Per-Week",
        sampleSize: "146"
      },
      {
        metrics: {
          accuracy: "0.927",
          falseNegativeRate: "0.722",
          falsePositiveRate: "0.019",
          selectionRate: "0.077"
        },
        name: "Cohort Marital-Status",
        sampleSize: "233"
      },
      {
        metrics: {
          accuracy: "0.75",
          falseNegativeRate: "0.667",
          falsePositiveRate: "0.071",
          selectionRate: "0.3"
        },
        name: "Cohort Index",
        sampleSize: "20"
      },
      {
        metrics: {
          accuracy: "0.734",
          falseNegativeRate: "0",
          falsePositiveRate: "1",
          selectionRate: "0.734"
        },
        name: "Cohort Predicted Y",
        sampleSize: "109"
      },
      {
        metrics: {
          accuracy: "0.65",
          falseNegativeRate: "0.35",
          falsePositiveRate: "N/A",
          selectionRate: "1"
        },
        name: "Cohort True Y",
        sampleSize: "123"
      }
    ],
    newCohort: {
      metrics: {
        accuracy: "0.858",
        falseNegativeRate: "0.344",
        falsePositiveRate: "0.077",
        selectionRate: "0.244"
      },
      name: "CohortCreateE2E-census",
      sampleSize: "499"
    }
  };
modelAssessmentDatasetsNewModelOverviewExperience.DiabetesDecisionMakingNewModelOverviewExperience.modelOverviewData =
  {
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
  };
modelAssessmentDatasetsNewModelOverviewExperience.DiabetesRegressionModelDebuggingNewModelOverviewExperience.modelOverviewData =
  {
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
  };
modelAssessmentDatasetsNewModelOverviewExperience.HousingClassificationModelDebuggingNewModelOverviewExperience.modelOverviewData =
  {
    featureCohortView: {
      multiFeatureCohorts: 6,
      singleFeatureCohorts: 3
    },
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          accuracy: "0.91",
          falseNegativeRate: "0.093",
          falsePositiveRate: "0.087",
          selectionRate: "0.499"
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
        selectionRate: "0.499"
      },
      name: "CohortCreateE2E-housing",
      sampleSize: "729"
    }
  };
modelAssessmentDatasetsNewModelOverviewExperience.HousingDecisionMakingNewModelOverviewExperience.modelOverviewData =
  {
    hasModelOverviewComponent: false
  };
modelAssessmentDatasetsNewModelOverviewExperience.MulticlassDnnModelDebuggingNewModelOverviewExperience.modelOverviewData =
  {
    featureCohortView: {
      multiFeatureCohorts: 9,
      singleFeatureCohorts: 3
    },
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          accuracy: "0.674"
        },
        name: "All data",
        sampleSize: "89"
      }
    ],
    newCohort: {
      metrics: {
        accuracy: "0.67"
      },
      name: "CohortCreateE2E-multiclass-dnn",
      sampleSize: "88"
    }
  };

const withType: {
  [key in keyof typeof modelAssessmentDatasets]: IModelAssessmentData;
} = modelAssessmentDatasets;

const allDatasets = {
  ...modelAssessmentDatasets,
  ...modelAssessmentDatasetsNewModelOverviewExperience
};
const allWithType: {
  [key in keyof typeof allDatasets]: IModelAssessmentData;
} = modelAssessmentDatasetsNewModelOverviewExperience;

export {
  withType as modelAssessmentDatasets,
  allWithType as modelAssessmentDatasetsIncludingFlights
};
