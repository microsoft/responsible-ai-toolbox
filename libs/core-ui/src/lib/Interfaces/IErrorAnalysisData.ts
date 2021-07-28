// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IErrorAnalysisData {
  tree?: IErrorAnalysisTreeNode[];
  tree_features?: string[];
  matrix?: IErrorAnalysisMatrix;
  matrix_features?: string[];
  maxDepth: number;
  numLeaves: number;
}
// Represents the data retrieved from the backend
export interface IErrorAnalysisTreeNode {
  arg: number | number[] | undefined;
  condition: string;
  error: number;
  id: number;
  isErrorMetric: boolean;
  method: string;
  metricName: string;
  metricValue: number;
  nodeIndex: number;
  nodeName: string;
  parentId: number | undefined;
  parentNodeName: string;
  pathFromRoot: string;
  size: number;
  sourceRowKeyHash: string;
  success: number;
  badFeaturesRowCount: number;
}

export type IErrorAnalysisMatrixCategory =
  | IErrorAnalysisMatrixClassificationCategory
  | IErrorAnalysisMatrixRegressionCategory;

export type IErrorAnalysisMatrix =
  | IErrorAnalysisMatrixClassification
  | IErrorAnalysisMatrixRegression;

export type IErrorAnalysisMatrixClassificationCategory = {
  values: number[];
  intervalMax?: never;
  intervalMin?: never;
};
export type IErrorAnalysisMatrixRegressionCategory = {
  values: number[];
  intervalMax: number[];
  intervalMin: number[];
};

type IErrorAnalysisMatrixClassification = {
  category1: IErrorAnalysisMatrixClassificationCategory;
  category2?: IErrorAnalysisMatrixClassificationCategory;
  matrix: IErrorAnalysisMatrixNodeClassification[][];
};

type IErrorAnalysisMatrixRegression = {
  category1: IErrorAnalysisMatrixRegressionCategory;
  category2?: IErrorAnalysisMatrixRegressionCategory;
  matrix: IErrorAnalysisMatrixNodeRegression[][];
};

export type IErrorAnalysisMatrixNode =
  | IErrorAnalysisMatrixNodeClassification
  | IErrorAnalysisMatrixNodeRegression;

export type IErrorAnalysisMatrixNodeClassification = {
  count: number;
  falseCount: number;
  metricValue?: never;
  metricName?: never;
};
export type IErrorAnalysisMatrixNodeRegression = {
  count: number;
  falseCount?: never;
  metricValue: number;
  metricName: string;
};
