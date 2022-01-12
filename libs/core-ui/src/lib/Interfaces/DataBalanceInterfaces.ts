// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IDataBalanceMeasures {
  aggregateBalanceMeasures: IAggregateBalanceMeasures;
  distributionBalanceMeasures: IDistributionBalanceMeasures;
  featureBalanceMeasures: IFeatureBalanceMeasures;
}

export interface IAggregateBalanceMeasures {
  measures: { [measureName: string]: number };
}

export function getAggregateBalanceMeasures(measures: {
  [measureName: string]: number;
}): { [measureName: string]: number } {
  return measures;
}

export interface IDistributionBalanceMeasures {
  measures: { [featureName: string]: { [measureName: string]: number } };
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
  featureValues: { [featureName: string]: string[] };
  features: string[];
  measures: {
    [featureName: string]: {
      [classKey: string]: { [measureName: string]: number };
    };
  };
}

export const measureVarNames = new Map<string, string>([
  // TODO: Positive rates aren't good to visualize in a heatmap, because it is per feature value, not a combination of feature values
  ["Demographic Parity", "dp"],
  ["Jaccard Index", "ji"],
  ["Kendall Rank Correlation", "krc"],
  ["Log-Likelihood Ratio", "llr"],
  ["Normalized PMI,	p(x,y) normalization", "n_pmi_xy"],
  ["Normalized PMI,	p(y) normalization", "n_pmi_y"],
  ["Pointwise Mutual Information (PMI)", "pmi"],
  // ["Positive Rates of Class A", "prA"],
  // ["Positive Rates of Class B", "prB"],
  ["Sorensen-Dice Coefficient", "sdc"],
  ["Squared PMI", "s_pmi"],
  ["t-test", "t_test"]
]);

export const measureRanges = new Map<string, number[]>([
  ["Demographic Parity", [-1, 1]]
]);

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
      // Measures are available for the string "classB__classA" but not for "classA__classB"
      // For certain measures, we need to inverse the measure value to get the correct values for classA and classB
      // We don't modify the underlying collection to preserve the original value, and instead return a new collection
      const measures = classes[classKey];
      const finalMeasures: { [measureName: string]: number } = {};
      for (const measure in measures) {
        switch (measure) {
          case "dp":
            finalMeasures[measure] = -1 * measures[measure];
            break;
          // case "prA":
          //   finalMeasures.prA = measures.prB;
          //   finalMeasures.prB = measures.prA;
          //   break;
          // case "prB":
          //   break;
          default:
            finalMeasures[measure] = measures[measure];
            break;
        }
      }

      return finalMeasures;
    }
  }

  return {};
}
