// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModelAssessmentData } from "./IModelAssessmentData";

const modelAssessmentDatasets = {
  ClassificationModelAssessment: {
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
      dropdownRowName: "Row 4",
      incorrectPredictionDatapoint: "102",
      noDataset: false,
      noFeatureImportance: false
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
    ]
  }
};

const withType: {
  [key in keyof typeof modelAssessmentDatasets]: IModelAssessmentData;
} = modelAssessmentDatasets;

export { withType as modelAssessmentDatasets };
