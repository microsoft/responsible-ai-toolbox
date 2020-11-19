// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const dummyTreeAdultCensusIncomeData = [
  {
    arg: "",
    badFeaturesRowCount: 0,
    condition: "",
    error: 18,
    id: 0,
    method: "",
    nodeIndex: 0,
    nodeName: "marital-status",
    parentId: "",
    parentNodeName: "",
    pathFromRoot: "",
    size: 48,
    sourceRowKeyHash: "hashkey",
    success: 30
  },
  {
    arg: [1],
    badFeaturesRowCount: 0,
    condition: "marital-status !=  Married-civ-spouse",
    error: 1,
    id: 1,
    method: "excludes",
    nodeIndex: 1,
    nodeName: "",
    parentId: 0,
    parentNodeName: "marital-status",
    pathFromRoot: "",
    size: 22,
    sourceRowKeyHash: "hashkey",
    success: 21
  },
  {
    arg: [1],
    badFeaturesRowCount: 0,
    condition: "marital-status ==  Married-civ-spouse",
    error: 17,
    id: 2,
    method: "includes",
    nodeIndex: 2,
    nodeName: "",
    parentId: 0,
    parentNodeName: "marital-status",
    pathFromRoot: "",
    size: 26,
    sourceRowKeyHash: "hashkey",
    success: 9
  }
];
