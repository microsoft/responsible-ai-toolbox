// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IDataBalanceMeasures {
  aggregateBalanceMeasures?: IAggregateBalanceMeasures;
  distributionBalanceMeasures?: IDistributionBalanceMeasures;
  featureBalanceMeasures?: IFeatureBalanceMeasures;
}

export interface IAggregateBalanceMeasures {
  measures?: { [measureName: string]: number };
}

export function getAggregateBalanceMeasures(measures: {
  [measureName: string]: number;
}): { [measureName: string]: number } {
  return measures;
}

export interface IDistributionBalanceMeasures {
  measures?: { [featureName: string]: { [measureName: string]: number } };
}

export function getDistributionBalanceMeasures(
  measures: { [featureName: string]: { [measureName: string]: number } },
  featureName: string
): { [measureName: string]: number } {
  if (featureName in measures) {
    return measures[featureName];
  }

  return {};
}

export interface IFeatureBalanceMeasures {
  classes?: { [featureName: string]: string[] };
  measures?: {
    [featureName: string]: {
      [classKey: string]: { [measureName: string]: number };
    };
  };
}

export function getFeatureBalanceMeasures(
  measures: {
    [featureName: string]: {
      [classKey: string]: { [measureName: string]: number };
    };
  },
  featureName: string,
  classA: string,
  classB: string
): { [measureName: string]: number } {
  const classes = measures[featureName];
  if (classes) {
    let classKey = `${classA}__${classB}`;
    if (classKey in classes) {
      return classes[classKey];
    }

    classKey = `${classB}__${classA}`;
    if (classKey in classes) {
      const measures = classes[classKey];
      for (const measure in measures) {
        // Measures are available for the string "classB__classA" but not for "classA__classB"
        // Therefore, we inverse the values of each measure to get the correct values for classA and classB
        measures[measure] *= -1;
      }

      return measures;
    }
  }

  return {};
}
