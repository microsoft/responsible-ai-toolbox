// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IDataBalanceMeasures {
  AggregateBalanceMeasures?: IAggregateBalanceMeasures;
  DistributionBalanceMeasures?: IDistributionBalanceMeasures;
  FeatureBalanceMeasures?: ITargetColumnFeatureBalanceMeasures;
}

export interface IAggregateBalanceMeasures {
  [measure: string]: number;
}

export interface IDistributionBalanceMeasures {
  [feature: string]: IDistributionBalanceMeasure;
}

export interface IDistributionBalanceMeasure {
  [measure: string]: number;
}

export interface ITargetColumnFeatureBalanceMeasures {
  [label: string]: IFeatureBalanceMeasures;
}

export interface IFeatureBalanceMeasures {
  [feature: string]: IFeatureBalanceMeasure[];
}

export interface IFeatureBalanceMeasure {
  [measure: string]: number | string;
  ClassA: string;
  ClassB: string;
}
