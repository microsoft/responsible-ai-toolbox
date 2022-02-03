// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IDataBalanceMeasures {
  aggregateBalanceMeasures?: IAggregateBalanceMeasures;
  distributionBalanceMeasures?: IDistributionBalanceMeasures;
  featureBalanceMeasures?: IFeatureBalanceMeasures;
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
  features: string[];
  measures: { [featureName: string]: { [measureName: string]: number } };
}

const blockedDistributionMeasures = new Set(["chi_sq_stat", "chi_sq_p_value"]);

export function getDistributionBalanceMeasures(
  measures: { [featureName: string]: { [measureName: string]: number } },
  featureName: string
): { [measureName: string]: number } {
  if (featureName in measures) {
    // Don't return measures that cannot be plotted in the same range as the other measures
    blockedDistributionMeasures.forEach((measureName) => {
      delete measures[featureName][measureName];
    });

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

interface IFeatureBalanceMeasure {
  varName: string;
  range: [number, number];
}

// Positive rates aren't good to visualize in a heatmap because it is per feature value, not a combination of feature values, so we exclude prA and prB
export const featureBalanceMeasureMap = new Map<string, IFeatureBalanceMeasure>(
  [
    ["Demographic Parity", { range: [-1, 1], varName: "dp" }],
    ["Jaccard Index", { range: [0, 1], varName: "ji" }],
    ["Kendall Rank Correlation", { range: [0, 1], varName: "krc" }],
    ["Log-Likelihood Ratio", { range: [0, 1], varName: "llr" }],
    [
      "Normalized PMI,	p(x,y) normalization",
      { range: [0, 1], varName: "n_pmi_xy" }
    ],
    [
      "Normalized PMI,	p(y) normalization",
      { range: [0, 1], varName: "n_pmi_y" }
    ],
    ["Pointwise Mutual Information (PMI)", { range: [0, 1], varName: "pmi" }],
    ["Sorensen-Dice Coefficient", { range: [0, 1], varName: "sdc" }],
    ["Squared PMI", { range: [0, 1], varName: "s_pmi" }],
    ["t-test", { range: [0, 1], varName: "t_test" }]
  ]
);

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
