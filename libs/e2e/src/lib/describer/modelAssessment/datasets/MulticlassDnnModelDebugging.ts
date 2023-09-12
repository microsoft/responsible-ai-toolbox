// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const MulticlassDnnModelDebugging = {
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
    avgOfAbsValue: "Average of absolute value",
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
  modelOverviewData: {
    featureCohortView: {
      firstFeatureToSelect: "total_phenols",
      multiFeatureCohorts: 9,
      secondFeatureToSelect: "hue",
      singleFeatureCohorts: 3
    },
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          accuracy: "0.674",
          macroF1Score: "0.673",
          macroPrecisionScore: "0.669",
          macroRecallScore: "0.677"
        },
        name: "All data",
        sampleSize: "89"
      }
    ],
    newCohort: {
      metrics: {
        accuracy: "0.67",
        macroF1Score: "0.671",
        macroPrecisionScore: "0.666",
        macroRecallScore: "0.675"
      },
      name: "CohortCreateE2E-multiclass-dnn",
      sampleSize: "88"
    }
  },
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
};
