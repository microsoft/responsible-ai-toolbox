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
  range?: [number, number];
  description?: string;
}

// Positive rates aren't good to visualize in a heatmap because it is per feature value, not a combination of feature values, so we exclude prA and prB
export const featureBalanceMeasureMap = new Map<string, IFeatureBalanceMeasure>(
  [
    // TODO: Figure out ranges for these measures
    [
      "Demographic Parity",
      {
        description:
          "Demographic Parity measures how much one class receives the positive outcome compared to the other class. As close to 0 means the classes receive the positive outcome equally.",
        range: [-1, 1],
        varName: "dp"
      }
    ],
    [
      "Jaccard Index",
      {
        description:
          "The Jaccard Similarity Index is a measure of the similarity between the two classes. The index ranges from 0 to 1. The closer to 1, the more similar the two classes.",
        range: [0, 1],
        varName: "ji"
      }
    ],
    ["Kendall Rank Correlation", { varName: "krc" }],
    ["Log-Likelihood Ratio", { varName: "llr" }],
    ["Normalized PMI, p(x,y) normalization", { varName: "n_pmi_xy" }],
    ["Normalized PMI, p(y) normalization", { varName: "n_pmi_y" }],
    ["Pointwise Mutual Information (PMI)", { varName: "pmi" }],
    ["Sorensen-Dice Coefficient", { varName: "sdc" }],
    ["Squared PMI", { varName: "s_pmi" }],
    ["t-test", { varName: "t_test" }],
    ["t-test, p-value", { varName: "ttest_pvalue" }]
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
  interpretation: string;
}

export const aggregateBalanceMeasureMap = new Map<
  string,
  IAggregateBalanceMeasure
>([
  [
    "atkinson_index",
    {
      description:
        "It presents the percentage of total income that a given society would have to forego in order to have more equal shares of income between its citizens. This measure depends on the degree of society aversion to inequality (a theoretical parameter decided by the researcher), where a higher value entails greater social utility or willingness by individuals to accept smaller incomes in exchange for a more equal distribution. An important feature of the Atkinson index is that it can be decomposed into within-group and between-group inequality.",
      interpretation:
        "Range: [0, 1]. 0 if perfect equality. 1 means maximum inequality. In our case, it is the proportion of records for a sensitive columns’ combination.",
      name: "Atkinson Index"
    }
  ],
  [
    "theil_t_index",
    {
      description:
        "GE(1) = Theil's T and is more sensitive to differences at the top of the distribution. The Theil index is a statistic used to measure economic inequality. The Theil index measures an entropic 'distance' the population is away from the 'ideal' egalitarian state of everyone having the same income.",
      interpretation:
        "If everyone has the same income, then T_T equals 0. If one person has all the income, then T_T gives the result ln(N). 0 means equal income and larger values mean higher level of disproportion.",
      name: "Theil T Index"
    }
  ],
  [
    "theil_l_index",
    {
      description:
        "GE(0) = Theil's L and is more sensitive to differences at the lower end of the distribution. Logarithm of (mean income)/(income i), over all the incomes included in the summation. It is also referred to as the mean log deviation measure. Because a transfer from a larger income to a smaller one will change the smaller income's ratio more than it changes the larger income's ratio, the transfer-principle is satisfied by this index.",
      interpretation: "Same interpretation as Theil T Index.",
      name: "Theil L Index"
    }
  ]
]);
