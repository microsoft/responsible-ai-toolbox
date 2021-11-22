// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IDataBalanceMeasures {
  featureBalanceMeasures?: IFeatureBalanceMeasures;
  distributionBalanceMeasures?: IDistributionBalanceMeasures;
  aggregateBalanceMeasures?: IAggregateBalanceMeasures;
}

export interface IFeatureBalanceMeasures {
  measures?: { [key: string]: { [key: string]: number } };
}

export interface IFeatureBalanceMeasure {
  // TODO: Make this interface an indexable type of something like featureName::classA::classB
  featureName?: string;
  classA?: string;
  classB?: string;
}

export interface IDistributionBalanceMeasures {
  measures?: { [key: string]: { [key: string]: number } };
}

export interface IAggregateBalanceMeasures {
  measures?: { [key: string]: number };
}
