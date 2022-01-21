// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import { ModelTypes } from "../Interfaces/IExplanationContext";

import { ClassificationEnum, JointDataset } from "./JointDataset";

export interface ILabeledStatistic {
  key: string;
  label: string;
  stat: number;
}

export enum BinaryClassificationMetrics {
  Accuracy = "accuracy",
  Precision = "precision",
  Recall = "recall",
  FalseNegativeRate = "falseNegativeRate",
  FalsePositiveRate = "falsePositiveRate",
  SelectionRate = "selectionRate",
  F1Score = "f1Score"
}

export enum RegressionMetrics {
  MeanSquaredError = "meanSquaredError",
  MeanAbsoluteError = "meanAbsoluteError",
  MeanPrediction = "meanPrediction",
  RSquared = "rSquared"
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
      key: BinaryClassificationMetrics.Accuracy,
      label: localization.Interpret.Statistics.accuracy,
      stat: (truePosCount + trueNegCount) / total
    },
    {
      key: BinaryClassificationMetrics.Precision,
      label: localization.Interpret.Statistics.precision,
      stat: truePosCount / (truePosCount + falsePosCount)
    },
    {
      key: BinaryClassificationMetrics.Recall,
      label: localization.Interpret.Statistics.recall,
      stat: truePosCount / (truePosCount + falseNegCount)
    },
    { key: BinaryClassificationMetrics.F1Score,
      label: localization.Interpret.Statistics.f1Score,
    stat: truePosCount / (truePosCount + 0.5 * (falsePosCount + falseNegCount))},
    {
      key: BinaryClassificationMetrics.FalsePositiveRate,
      label: localization.Interpret.Statistics.fpr,
      stat: falsePosCount / (trueNegCount + falsePosCount)
    },
    {
      key: BinaryClassificationMetrics.FalseNegativeRate,
      label: localization.Interpret.Statistics.fnr,
      stat: falseNegCount / (truePosCount + falseNegCount)
    },
    {
      key: BinaryClassificationMetrics.SelectionRate,
      label: localization.Interpret.Statistics.selectionRate,
      stat: (falseNegCount + truePosCount) / total
    },
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
  const meanAbsoluteError = errors.reduce((prev, curr) => {
    return prev + Math.abs(curr);
  })
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
      key: RegressionMetrics.MeanAbsoluteError,
      label: localization.Interpret.Statistics.mae,
      stat: meanAbsoluteError
    },
    {
      key: RegressionMetrics.MeanSquaredError,
      label: localization.Interpret.Statistics.mse,
      stat: residualSumOfSquares / count
    },
    {
      key: RegressionMetrics.RSquared,
      label: localization.Interpret.Statistics.rSquared,
      stat: 1 - residualSumOfSquares / totalSumOfSquares
    },
    {
      key: RegressionMetrics.MeanPrediction,
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
