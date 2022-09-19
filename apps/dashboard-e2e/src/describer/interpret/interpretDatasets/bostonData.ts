// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const bostonData = {
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
};
export const bostonDataGlobal = {
  datapoint: 102,
  datasetBarLabel: ["0 - 20", "21 - 40", "41 - 60", "61 - 80", "81 - 101"],
  defaultXAxis: "Index",
  defaultYAxis: "CRIM",
  featureNames: ["INDUS", "DIS", "NOX", "LSTAT", "AGE", "CHAS", "B", "CRIM"],
  noLocalImportance: true
};
export const bostonDataNoDataset = {
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
};
export const bostonDataNoPredict = {
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
  noPredict: true
};
export const bostonDataNoY = {
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
  noPredict: true,
  noY: true
};
