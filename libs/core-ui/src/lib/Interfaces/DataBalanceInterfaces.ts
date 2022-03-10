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

// TODO: Create a map of Distribution Balance Measure descriptions to use for tooltips
// TODO: Don't render the variable names, instead use the proper measure names

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
  description: string;
  range?: [number, number];
}

// Positive rates aren't good to visualize in a heatmap because it is per feature value, not a combination of feature values, so we exclude prA and prB
export const featureBalanceMeasureMap = new Map<string, IFeatureBalanceMeasure>(
  [
    // TODO: Figure out ranges for these measures
    [
      "Demographic Parity",
      {
        description:
          "<b>Demographic Parity</b> measures how much one class receives the positive outcome compared to the other class. As close to 0 means both classes receive the positive outcome equally.",
        range: [-1, 1],
        varName: "dp"
      }
    ],
    [
      "Jaccard Index",
      {
        description:
          "<b>Jaccard Index</b> is a measure of the similarity between the two classes. The index ranges from 0 to 1. The closer to 1, the more similar the two classes.",
        range: [0, 1],
        varName: "ji"
      }
    ],
    ["Kendall Rank Correlation", { description: "TODO", varName: "krc" }],
    ["Log-Likelihood Ratio", { description: "TODO", varName: "llr" }],
    [
      "Normalized PMI, p(x,y) normalization",
      { description: "TODO", varName: "n_pmi_xy" }
    ],
    [
      "Normalized PMI, p(y) normalization",
      { description: "TODO", varName: "n_pmi_y" }
    ],
    [
      "Pointwise Mutual Information (PMI)",
      { description: "TODO", varName: "pmi" }
    ],
    ["Sorensen-Dice Coefficient", { description: "TODO", varName: "sdc" }],
    ["Squared PMI", { description: "TODO", varName: "s_pmi" }],
    ["t-test", { description: "TODO", varName: "t_test" }],
    ["t-test, p-value", { description: "TODO", varName: "ttest_pvalue" }]
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

interface IAggregateBalanceMeasure {
  name: string;
  description: string;
}

export const aggregateBalanceMeasureMap = new Map<
  string,
  IAggregateBalanceMeasure
>([
  [
    "atkinson_index",
    {
      description:
        "<b>Atkinson Index</b> measures the percentage of total data that must be removed in order to have a perfectly balanced dataset, with respect to the selected features. Its range is [0, 1], where 0 means perfect equality and 1 means maximum inequality.",
      name: "Atkinson Index"
    }
  ],
  [
    "theil_t_index",
    {
      description:
        "If the data contains every feature combination equally, then the Theil T Index equals 0. If one feature combination is seen in 100% of the data, then the Theil T Index equals ln(N) (where N = number of features).",
      name: "Theil T Index"
    }
  ],
  [
    "theil_l_index",
    {
      description: "TODO",
      name: "Theil L Index"
    }
  ]
]);
