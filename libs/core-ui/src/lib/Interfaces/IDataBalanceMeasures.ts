// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IDataBalanceMeasures {
  AggregateBalanceMeasures?: IAggregateBalanceMeasures;
  DistributionBalanceMeasures?: IDistributionBalanceMeasures;
  FeatureBalanceMeasures?: IFeatureBalanceMeasures;
}

export interface IAggregateBalanceMeasures {
  [key: string]: number;
}

export interface IDistributionBalanceMeasures {
  [key: string]: IDistributionBalanceMeasure;
}

export interface IDistributionBalanceMeasure {
  [key: string]: number;
}

export interface IFeatureBalanceMeasures {
  [key: string]: IFeatureBalanceMeasure[];
}

export interface IFeatureBalanceMeasure {
  [key: string]: number | string;
  ClassA: string;
  ClassB: string;
}
