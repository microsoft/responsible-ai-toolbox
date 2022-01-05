// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ClassificationEnum,
  JointDataset,
  ModelTypes
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export interface ILabeledStatistic {
  label: string;
  stat: number;
}

const generateBinaryStats: (outcomes: number[]) => ILabeledStatistic[] = (
  outcomes: number[]
): ILabeledStatistic[] => {
  const falseNegCount = outcomes.filter(
    (x) => x === ClassificationEnum.FalseNegative
  ).length;
  const falsePosCount = outcomes.filter(
    (x) => x === ClassificationEnum.FalsePositive
  ).length;
  const trueNegCount = outcomes.filter(
    (x) => x === ClassificationEnum.TrueNegative
  ).length;
  const truePosCount = outcomes.filter(
    (x) => x === ClassificationEnum.TruePositive
  ).length;
  const total = outcomes.length;
  return [
    {
      label: localization.Interpret.Statistics.accuracy,
      stat: (truePosCount + trueNegCount) / total
    },
    {
      label: localization.Interpret.Statistics.precision,
      stat: truePosCount / (truePosCount + falsePosCount)
    },
    {
      label: localization.Interpret.Statistics.recall,
      stat: truePosCount / (truePosCount + falseNegCount)
    },
    {
      label: localization.Interpret.Statistics.fpr,
      stat: falsePosCount / (trueNegCount + falsePosCount)
    },
    {
      label: localization.Interpret.Statistics.fnr,
      stat: falseNegCount / (truePosCount + falseNegCount)
    }
  ];
};

const generateRegressionStats: (
  trueYs: number[],
  predYs: number[],
  errors: number[]
) => ILabeledStatistic[] = (
  trueYs: number[],
  predYs: number[],
  errors: number[]
): ILabeledStatistic[] => {
  const count = trueYs.length;
  const residualSumOfSquares = errors.reduce((prev, curr) => {
    return prev + curr * curr;
  }, 0);
  const avgY =
    trueYs.reduce((prev, curr) => {
      return prev + curr;
    }, 0) / count;
  const totalSumOfSquares = trueYs.reduce((prev, curr) => {
    return prev + (curr - avgY) * (curr - avgY);
  }, 0);
  return [
    {
      label: localization.Interpret.Statistics.mse,
      stat: residualSumOfSquares / count
    },
    {
      label: localization.Interpret.Statistics.rSquared,
      stat: 1 - residualSumOfSquares / totalSumOfSquares
    },
    {
      label: localization.Interpret.Statistics.meanPrediction,
      stat:
        predYs.reduce((prev, curr) => {
          return prev + curr;
        }, 0) / count
    }
  ];
};

export const generateMetrics: (
  jointDataset: JointDataset,
  selectionIndexes: number[][],
  modelType: ModelTypes
) => ILabeledStatistic[][] = (
  jointDataset: JointDataset,
  selectionIndexes: number[][],
  modelType: ModelTypes
): ILabeledStatistic[][] => {
  if (modelType === ModelTypes.Binary) {
    const outcomes = jointDataset.unwrap(JointDataset.ClassificationError);
    return selectionIndexes.map((selectionArray) => {
      const outcomeSubset = selectionArray.map((i) => outcomes[i]);
      return generateBinaryStats(outcomeSubset);
    });
  }
  if (modelType === ModelTypes.Regression) {
    const trueYs = jointDataset.unwrap(JointDataset.TrueYLabel);
    const predYs = jointDataset.unwrap(JointDataset.PredictedYLabel);
    const errors = jointDataset.unwrap(JointDataset.RegressionError);
    return selectionIndexes.map((selectionArray) => {
      const trueYSubset = selectionArray.map((i) => trueYs[i]);
      const predYSubset = selectionArray.map((i) => predYs[i]);
      const errorsSubset = selectionArray.map((i) => errors[i]);
      return generateRegressionStats(trueYSubset, predYSubset, errorsSubset);
    });
  }
  return [];
};
