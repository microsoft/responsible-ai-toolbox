// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IDataBalanceMeasures {
  AggregateBalanceMeasures?: IAggregateBalanceMeasures;
  DistributionBalanceMeasures?: IDistributionBalanceMeasures;
  FeatureBalanceMeasures?: IFeatureBalanceMeasures;
}

export interface IAggregateBalanceMeasures {
  AtkinsonIndex: number;
  TheilLIndex: number;
  TheilTIndex: number;
}

export interface IDistributionBalanceMeasures {
  [key: string]: IDistributionBalanceMeasure;
}

export interface IDistributionBalanceMeasure {
  ChiSquarePValue: number;
  ChiSquareStat: number;
  InfiniteNormDist: number;
  JensenShannonDist: number;
  KLDivergence: number;
  TotalVarianceDist: number;
  WassersteinDist: number;
  CrossEntropy: number;
}

export interface IFeatureBalanceMeasures {
  [key: string]: IFeatureBalanceMeasure[];
}

export interface IFeatureBalanceMeasure {
  ClassA: string;
  ClassB: string;
  StatisticalParity: number;
  PointwiseMutualInfo: number;
  SorensonDiceCoeff: number;
  JaccardIndex: number;
  KendallRankCorrelation: number;
  LogLikelihoodRatio: number;
  TTest: number;
  TTestPValue: number;
}
