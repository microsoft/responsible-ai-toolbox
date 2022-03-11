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

interface DistributionMeasureInfo {
  name: string;
  description?: string;
}

export const ApprovedDistributionMeasures = new Map<
  string,
  DistributionMeasureInfo
>([
  ["inf_norm_dist", { name: "Infinite Norm Distance" }],
  ["js_dist", { name: "Jensen–Shannon Distance" }],
  ["kl_divergence", { name: "Kullback-Leibler Divergence" }],
  ["total_variation_dist", { name: "Total Variation Distance" }],
  ["wasserstein_dist", { name: "Wasserstein Distance" }]
]);

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
  uniqueClasses: { [featureName: string]: string[] };
  features: string[];
  measures: {
    [featureName: string]: {
      [classKey: string]: { [measureName: string]: number };
    };
  };
}

interface FeatureBalanceMeasureInfo {
  varName: string;
  description: string;
  range?: [number, number];
}

// The key is the formatted name instead of var name because its keys are used to populate the Measure Dropdown
export const ApprovedFeatureBalanceMeasures = new Map<
  string,
  FeatureBalanceMeasureInfo
>([
  [
    "Demographic Parity",
    {
      description:
        "<b>Demographic Parity</b> measures how much one class receives the positive outcome compared to the other class.<br>As close to 0 means both classes receive the positive outcome equally. A <b>positive value</b> means the first class<br>sees the positive label more than the second class. A <b>negative value</b> means the opposite.",
      range: [-1, 1],
      varName: "dp"
    }
  ],
  [
    "Pointwise Mutual Information (PMI)",
    {
      // range: [-inf, +inf] => not specified so chart uses min/max values
      description:
        "The <b>PMI</b> of a pair of classes quantifies the discrepancy between the probability of their coincidence<br>given their joint distribution and their individual distributions (assuming independence).",
      varName: "pmi"
    }
  ],
  [
    "Jaccard Index",
    {
      description:
        "<b>Jaccard Index</b> is a measure of the similarity between the two classes.<br>The index ranges from 0 to 1. The closer to 1, the more similar the two classes.",
      range: [0, 1],
      varName: "ji"
    }
  ],
  [
    "Sorensen-Dice Coefficient (SDC)",
    {
      description:
        "The <b>SDC</b> is used to gauge the similarity of two samples. Related to F1 score.<br>It equals twice the number of elements common to both sets divided by the sum of the number of elements in each set.",
      range: [0, 1],
      varName: "sdc"
    }
  ],
  [
    "Kendall Rank Correlation",
    {
      description:
        "<b>Kendall Rank Correlation</b> is a statistic used to measure the ordinal association between two measured quantities.<br>It is high when observations have a similar rank and low when observations have a dissimilar rank between the two classes.",
      range: [-1, 1],
      varName: "krc"
    }
  ],
  [
    "Log-Likelihood Ratio",
    {
      // range: [-inf, +inf] => not specified so chart uses min/max values
      description:
        "<b>Log-Likelihood Ratio</b> calculates the degree to which data supports one variable versus another.<br>Log of the likelihood ratio, which gives the probability of correctly predicting the label in ratio to probability of incorrectly predicting label.<br>If likelihoods are similar, it should be close to 0.",
      varName: "llr"
    }
  ]
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

interface AggregateMeasureInfo {
  name: string;
  description: string;
}

export const ApprovedAggregateMeasures = new Map<string, AggregateMeasureInfo>([
  [
    "atkinson_index",
    {
      description:
        "<b>Atkinson Index</b> measures the percentage of total data that must be removed<br>in order to have a perfectly balanced dataset, with respect to the selected features.<br>Its range is [0, 1], where 0 means perfect equality and 1 means maximum inequality for the features selected.",
      name: "Atkinson Index"
    }
  ],
  [
    "theil_t_index",
    {
      description:
        "<b>Theil T Index</b> is more sensitive to differences at the top of the distribution.<br>If the data contains every feature combination equally, then it equals 0.<br>If one feature combination is seen in 100% of the data,<br>then the Theil T Index equals ln(N) (where N = number of feature combinations).",
      name: "Theil T Index"
    }
  ],
  [
    "theil_l_index",
    {
      description:
        "<b>Theil L Index</b> is more sensitive to differences at the lower end of the distribution.<br>It is 0 when feature combination is seen equally and takes larger positive values<br>as feature combinations become more unequal, especially at the high end.",
      name: "Theil L Index"
    }
  ]
]);
