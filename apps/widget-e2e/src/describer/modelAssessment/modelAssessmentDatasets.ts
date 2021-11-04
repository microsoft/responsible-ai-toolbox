// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModelAssessmentData } from "./IModelAssessmentData";

const modelAssessmentDatasets = {
  classificationModelAssessment: {
    errorAnalysisData: {
      defaultMetric: "Error rate",
      metricList: [
        "Error rate",
        "Precision score",
        "Recall score",
        "F1 score",
        "Accuracy score"
      ],
      hoverNodeData: {
        Correct: "398",
        Incorrect: "102",
        "Error coverage": "100.00%",
        "Error rate": "20.40%"
      },
      nodeValuesOnMetricChange: {
        nodeValue: "0.18",
        Correct: "186",
        Incorrect: "77.00",
        "Error coverage": "75.49%",
        "Error rate": "0.18"
      },
      nodeHeader: "77/186",
      filterInfoOnBranch: [
        "marital-status == Married-civ-spouse",
        "age > 32.50"
      ],
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
      errorCoverage: "75.49%",
      errorRate: "41.40%",
      modelStatisticsData: {}
    }
  }
};

const withType: {
  [key in keyof typeof modelAssessmentDatasets]: IModelAssessmentData;
} = modelAssessmentDatasets;

export { withType as modelAssessmentDatasets };
