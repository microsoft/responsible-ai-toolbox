// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IInterpretData } from "./IInterpretData";

const interpretDatasets = {
  automlMimicAdult: {
    featureNames: [
      "Column6",
      "Column5",
      "Column1",
      "Column13",
      "Column11",
      "Column10",
      "Column7",
      "Column8",
      "Column2",
      "Column12",
      "Column9",
      "Column3",
      "Column4",
      "Column14"
    ],
    noDataset: true
  },
  bostonData: {
    datapoint: 102,
    datasetBarLabel: ["0 - 20", "21 - 40", "41 - 60", "61 - 80", "81 - 101"],
    defaultXAxis: "Index",
    defaultYAxis: "CRIM",
    featureNames: [
      "LSTAT",
      "RM",
      "PTRATIO",
      "NOX",
      "DIS",
      "AGE",
      "TAX",
      "CRIM",
      "B",
      "INDUS",
      "RAD",
      "ZN",
      "CHAS"
    ]
  },
  bostonDataGlobal: {
    datapoint: 102,
    datasetBarLabel: ["0 - 20", "21 - 40", "41 - 60", "61 - 80", "81 - 101"],
    defaultXAxis: "Index",
    defaultYAxis: "CRIM",
    featureNames: [
      "LSTAT",
      "RM",
      "PTRATIO",
      "NOX",
      "DIS",
      "AGE",
      "TAX",
      "CRIM",
      "B",
      "INDUS",
      "RAD",
      "ZN",
      "CHAS"
    ],
    noLocalImportance: true
  },
  bostonDataNoDataset: {
    datasetBarLabel: ["0 - 20", "21 - 40", "41 - 60", "61 - 80", "81 - 101"],
    featureNames: [
      "LSTAT",
      "RM",
      "PTRATIO",
      "NOX",
      "DIS",
      "AGE",
      "TAX",
      "CRIM",
      "B",
      "INDUS",
      "RAD",
      "ZN",
      "CHAS"
    ],
    noDataset: true
  },
  bostonDataNoPredict: {
    datapoint: 102,
    datasetBarLabel: ["0 - 20", "21 - 40", "41 - 60", "61 - 80", "81 - 101"],
    featureNames: [
      "LSTAT",
      "RM",
      "PTRATIO",
      "NOX",
      "DIS",
      "AGE",
      "TAX",
      "CRIM",
      "B",
      "INDUS",
      "RAD",
      "ZN",
      "CHAS"
    ],
    noPredict: true,
    noY: true
  },
  bostonDataNoY: {
    datapoint: 102,
    datasetBarLabel: ["0 - 20", "21 - 40", "41 - 60", "61 - 80", "81 - 101"],
    defaultXAxis: "Index",
    defaultYAxis: "CRIM",
    featureNames: [
      "LSTAT",
      "RM",
      "PTRATIO",
      "NOX",
      "DIS",
      "AGE",
      "TAX",
      "CRIM",
      "B",
      "INDUS",
      "RAD",
      "ZN",
      "CHAS"
    ],
    noY: true
  },
  breastCancerData: {
    datapoint: 114,
    datasetBarLabel: ["0 - 22", "23 - 45", "46 - 67", "68 - 90", "91 - 113"],
    defaultXAxis: "Index",
    defaultYAxis: "mean radius",
    featureNames: [
      "worst area",
      "worst perimeter",
      "mean area",
      "mean perimeter",
      "area error",
      "worst texture",
      "mean texture",
      "worst radius",
      "mean radius",
      "mean fractal dimen...",
      "texture error",
      "worst smoothness",
      "mean smoothness",
      "mean compactness",
      "worst fractal dime...",
      "mean concave point...",
      "compactness error",
      "symmetry error",
      "worst symmetry",
      "concave points err...",
      "mean concavity",
      "smoothness error",
      "worst compactness",
      "fractal dimension ...",
      "perimeter error",
      "worst concave poin...",
      "mean symmetry",
      "worst concavity",
      "concavity error",
      "radius error"
    ],
    isClassification: true
  },
  ebmData: {
    datapoint: 2,
    datasetBarLabel: ["0", "1"],
    defaultXAxis: "Index",
    defaultYAxis: "Age",
    featureNames: ["Age", "Employment"],
    noFeatureImportance: true,
    noY: true
  },
  ibmData: {
    datapoint: 20,
    datasetBarLabel: ["0 - 3", "4 - 7", "8 - 11", "12 - 15", "16 - 19"],
    defaultXAxis: "Index",
    defaultYAxis: "Age",
    featureNames: [
      "OverTime",
      "JobRole",
      "MaritalStatus",
      "YearsAtCompany",
      "JobSatisfaction",
      "TotalWorkingYears",
      "YearsSinceLastProm...",
      "YearsInCurrentRole",
      "YearsWithCurrManag...",
      "NumCompaniesWorked",
      "EducationField",
      "JobInvolvement",
      "RelationshipSatisf...",
      "EnvironmentSatisfa...",
      "Age",
      "DistanceFromHome",
      "MonthlyIncome",
      "WorkLifeBalance",
      "TrainingTimesLastY...",
      "JobLevel",
      "Department",
      "StockOptionLevel",
      "DailyRate",
      "Gender",
      "BusinessTravel",
      "MonthlyRate",
      "PerformanceRating",
      "Education",
      "HourlyRate",
      "PercentSalaryHike"
    ],
    isClassification: true
  },
  ibmDataInconsistent: {
    datapoint: 20,
    datasetBarLabel: ["0 - 3", "4 - 7", "8 - 11", "12 - 15", "16 - 19"],
    defaultXAxis: "Index",
    defaultYAxis: "Age",
    errorMessage:
      "Inconsistent dimensions. Predicted probability[0] has dimensions 2, expected 1",
    featureNames: [
      "OverTime",
      "JobRole",
      "MaritalStatus",
      "YearsAtCompany",
      "JobSatisfaction",
      "TotalWorkingYears",
      "YearsSinceLastProm...",
      "YearsInCurrentRole",
      "YearsWithCurrManag...",
      "NumCompaniesWorked",
      "EducationField",
      "JobInvolvement",
      "RelationshipSatisf...",
      "EnvironmentSatisfa...",
      "Age",
      "DistanceFromHome",
      "MonthlyIncome",
      "WorkLifeBalance",
      "TrainingTimesLastY...",
      "JobLevel",
      "Department",
      "StockOptionLevel",
      "DailyRate",
      "Gender",
      "BusinessTravel",
      "MonthlyRate",
      "PerformanceRating",
      "Education",
      "HourlyRate",
      "PercentSalaryHike"
    ]
  },
  ibmNoClass: {
    datapoint: 20,
    datasetBarLabel: ["0 - 3", "4 - 7", "8 - 11", "12 - 15", "16 - 19"],
    defaultXAxis: "Index",
    defaultYAxis: "Age",
    featureNames: [
      "OverTime",
      "JobRole",
      "MaritalStatus",
      "YearsAtCompany",
      "JobSatisfaction",
      "TotalWorkingYears",
      "YearsSinceLastProm...",
      "YearsInCurrentRole",
      "YearsWithCurrManag...",
      "NumCompaniesWorked",
      "EducationField",
      "JobInvolvement",
      "RelationshipSatisf...",
      "EnvironmentSatisfa...",
      "Age",
      "DistanceFromHome",
      "MonthlyIncome",
      "WorkLifeBalance",
      "TrainingTimesLastY...",
      "JobLevel",
      "Department",
      "StockOptionLevel",
      "DailyRate",
      "Gender",
      "BusinessTravel",
      "MonthlyRate",
      "PerformanceRating",
      "Education",
      "HourlyRate",
      "PercentSalaryHike"
    ],
    isClassification: true
  },
  irisData: {
    datapoint: 30,
    datasetBarLabel: ["0 - 5", "6 - 11", "12 - 17", "18 - 23", "24 - 29"],
    defaultXAxis: "Index",
    defaultYAxis: "sepal length (cm)",
    featureNames: [
      "petal length (cm)",
      "petal width (cm)",
      "sepal length (cm)",
      "sepal width (cm)"
    ],
    isClassification: true,
    isMulticlass: true
  },
  irisDataNoLocal: {
    datapoint: 30,
    datasetBarLabel: ["0 - 5", "6 - 11", "12 - 17", "18 - 23", "24 - 29"],
    defaultXAxis: "Index",
    defaultYAxis: "sepal length (cm)",
    featureNames: [
      "petal length (cm)",
      "petal width (cm)",
      "sepal length (cm)",
      "sepal width (cm)"
    ],
    isClassification: true,
    isMulticlass: true,
    noLocalImportance: true
  },
  irisGlobal: {
    featureNames: [
      "petal length (cm)",
      "petal width (cm)",
      "sepal length (cm)",
      "sepal width (cm)"
    ],
    isClassification: true,
    isMulticlass: true,
    noDataset: true,
    noLocalImportance: true,
    noY: true
  },
  irisNoData: {
    featureNames: [
      "petal length (cm)",
      "petal width (cm)",
      "sepal length (cm)",
      "sepal width (cm)"
    ],
    isClassification: true,
    isMulticlass: true,
    noDataset: true
  },
  irisNoFeatures: {
    datapoint: 30,
    datasetBarLabel: ["0 - 5", "6 - 11", "12 - 17", "18 - 23", "24 - 29"],
    defaultXAxis: "Index",
    defaultYAxis: "Feature 0",
    featureNames: ["Feature 2", "Feature 3", "Feature 0", "Feature 1"],
    isClassification: true,
    isMulticlass: true
  }
};
const withType: {
  [key in keyof typeof interpretDatasets]: IInterpretData;
} = interpretDatasets;

export { withType as interpretDatasets };
