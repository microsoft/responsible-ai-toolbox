// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IErrorAnalysisData {
  tree?: IErrorAnalysisTreeNode[];
  tree_features?: string[];
  matrix?: IErrorAnalysisMatrix;
  matrix_features?: string[];
  importances?: number[];
  maxDepth: number;
  numLeaves: number;
  minChildSamples: number;
  metric: string;
  root_stats?: IErrorAnalysisRootStats;
}

export interface IErrorAnalysisRootStats {
  metricName: string;
  metricValue: number;
  totalSize: number;
  errorCoverage: number;
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
  matrix: IErrorAnalysisMatrixClassificationNode[][];
};

type IErrorAnalysisMatrixRegression = {
  category1: IErrorAnalysisMatrixRegressionCategory;
  category2?: IErrorAnalysisMatrixRegressionCategory;
  matrix: IErrorAnalysisMatrixRegressionNode[][];
};

export type IErrorAnalysisMatrixNode =
  | IErrorAnalysisMatrixClassificationNode
  | IErrorAnalysisMatrixRegressionNode;

export type IErrorAnalysisMatrixClassificationNode =
  | IErrorAnalysisMatrixNodeErrorRate
  | IErrorAnalysisMatrixNodeConfusionMetric;

export type IErrorAnalysisMatrixRegressionNode =
  IErrorAnalysisMatrixNodeSimpleMetric;

export type IErrorAnalysisMatrixNodeErrorRate = {
  count: number;
  error: never;
  falseCount: number;
  metricValue?: never;
  metricName?: never;
  tp: never;
  fp: never;
  fn: never;
  tn: never;
};

export type IErrorAnalysisMatrixNodeSimpleMetric = {
  count: number;
  error: never;
  falseCount?: never;
  metricValue: number;
  metricName: string;
  tp: never;
  fp: never;
  fn: never;
  tn: never;
};

export type IErrorAnalysisMatrixNodeConfusionMetric = {
  count: number;
  error: number;
  falseCount?: never;
  metricValue: number;
  metricName: string;
  tp: number[];
  fp: number[];
  fn: number[];
  tn: number[];
};
