// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const CensusClassificationModelDebugging = {
  causalAnalysisData: {
    hasCausalAnalysisComponent: false
  },
  checkDupCohort: true,
  cohortDefaultName: "All data",
  dataBalanceData: {
    aggregateBalanceMeasuresComputed: true,
    distributionBalanceMeasuresComputed: true,
    featureBalanceMeasuresComputed: true
  },
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
    avgOfAbsValue: "Average of absolute value",
    datapoint: 500,
    dropdownRowName: "Row 4",
    hasCorrectIncorrectDatapoints: true,
    hasFeatureImportanceComponent: true,
    newFeatureDropdownValue: "workclass",
    noDataset: false,
    noFeatureImportance: false,
    noLocalImportance: false,
    rowToSelect: "4",
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
  isBinary: true,
  modelOverviewData: {
    featureCohortView: {
      firstFeatureToSelect: "age",
      multiFeatureCohorts: 6,
      secondFeatureToSelect: "gender",
      singleFeatureCohorts: 3
    },
    hasModelOverviewComponent: true,
    initialCohorts: [
      {
        metrics: {
          accuracy: "0.856",
          falseNegativeRate: "0.35",
          falsePositiveRate: "0.077",
          selectionRate: "0.218"
        },
        name: "All data",
        sampleSize: "500"
      },
      {
        metrics: {
          accuracy: "0.753",
          falseNegativeRate: "0.313",
          falsePositiveRate: "0.195",
          selectionRate: "0.411"
        },
        name: "Cohort Age and Hours-Per-Week",
        sampleSize: "146"
      },
      {
        metrics: {
          accuracy: "0.927",
          falseNegativeRate: "0.722",
          falsePositiveRate: "0.019",
          selectionRate: "0.039"
        },
        name: "Cohort Marital-Status",
        sampleSize: "233"
      },
      {
        metrics: {
          accuracy: "0.75",
          falseNegativeRate: "0.667",
          falsePositiveRate: "0.071",
          selectionRate: "0.15"
        },
        name: "Cohort Index",
        sampleSize: "20"
      },
      {
        metrics: {
          accuracy: "0.734",
          falseNegativeRate: "0",
          falsePositiveRate: "1",
          selectionRate: "1"
        },
        name: "Cohort Predicted Y",
        sampleSize: "109"
      },
      {
        metrics: {
          accuracy: "0.65",
          falseNegativeRate: "0.35",
          falsePositiveRate: "N/A",
          selectionRate: "0.65"
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
        selectionRate: "0.218"
      },
      name: "CohortCreateE2E-census",
      sampleSize: "499"
    }
  },
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
};
