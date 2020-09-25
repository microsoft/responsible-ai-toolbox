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
    noDatasetExplorer: true
  },
  bostonData: {
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
    datasetBarLabel: ["0 - 20", "21 - 40", "41 - 60", "61 - 80", "81 - 101"]
  },
  bostonDataGlobal: {
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
    datasetBarLabel: ["0 - 20", "21 - 40", "41 - 60", "61 - 80", "81 - 101"],
    noLocalImportance: true
  },
  breastCancerData: {
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
    datasetBarLabel: ["0 - 22", "23 - 45", "46 - 67", "68 - 90", "91 - 113"]
  },
  ebmData: {
    featureNames: ["Age", "Employment"],
    datasetBarLabel: ["0", "1"],
    noFeatureImportance: true
  },
  ibmData: {
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
    datasetBarLabel: ["0 - 3", "4 - 7", "8 - 11", "12 - 15", "16 - 19"]
  },
  ibmDataInconsistent: {
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
    ],
    datasetBarLabel: ["0 - 3", "4 - 7", "8 - 11", "12 - 15", "16 - 19"]
  },
  ibmNoClass: {
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
    datasetBarLabel: ["0 - 3", "4 - 7", "8 - 11", "12 - 15", "16 - 19"]
  },
  irisData: {
    featureNames: [
      "petal length (cm)",
      "petal width (cm)",
      "sepal length (cm)",
      "sepal width (cm)"
    ],
    datasetBarLabel: ["0 - 5", "6 - 11", "12 - 17", "18 - 23", "24 - 29"]
  },
  irisDataGlobal: {
    featureNames: [
      "petal length (cm)",
      "petal width (cm)",
      "sepal length (cm)",
      "sepal width (cm)"
    ],
    datasetBarLabel: ["0 - 5", "6 - 11", "12 - 17", "18 - 23", "24 - 29"],
    noLocalImportance: true
  },
  irisGlobal: {
    featureNames: [
      "petal length (cm)",
      "petal width (cm)",
      "sepal length (cm)",
      "sepal width (cm)"
    ],
    noLocalImportance: true,
    noDatasetExplorer: true
  },
  irisNoData: {
    featureNames: [
      "petal length (cm)",
      "petal width (cm)",
      "sepal length (cm)",
      "sepal width (cm)"
    ],
    noDatasetExplorer: true
  },
  irisNoFeatures: {
    featureNames: ["Feature 2", "Feature 3", "Feature 0", "Feature 1"],
    datasetBarLabel: ["0 - 5", "6 - 11", "12 - 17", "18 - 23", "24 - 29"]
  }
};
const withType: {
  [key in keyof typeof interpretDatasets]: IInterpretData;
} = interpretDatasets;

export { withType as interpretDatasets };
