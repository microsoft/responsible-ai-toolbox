// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import { ModelTypes } from "../Interfaces/IExplanationContext";
import {
  ILabeledStatistic,
  TotalCohortSamples
} from "../Interfaces/IStatistic";
import { IsBinary } from "../util/ExplanationUtils";

import { generateImageStats } from "./ImageStatisticsUtils";
import { JointDataset } from "./JointDataset";
import {
  ClassificationEnum,
  MulticlassClassificationEnum
} from "./JointDatasetUtils";
import { generateMultilabelStats } from "./MultilabelStatisticsUtils";
import { generateObjectDetectionStats } from "./ObjectDetectionStatisticsUtils";
import { generateQuestionAnsweringStats } from "./QuestionAnsweringStatisticsUtils";
import {
  BinaryClassificationMetrics,
  MulticlassClassificationMetrics,
  RegressionMetrics
} from "./StatisticsUtilsEnums";

type QuestionAnsweringCacheType = Map<
  string,
  [number, number, number, number, number, number]
>;

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
      key: TotalCohortSamples,
      label: localization.Interpret.Statistics.samples,
      stat: total
    },
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
    {
      key: BinaryClassificationMetrics.F1Score,
      label: localization.Interpret.Statistics.f1Score,
      stat:
        truePosCount / (truePosCount + 0.5 * (falsePosCount + falseNegCount))
    },
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
      stat: (falsePosCount + truePosCount) / total
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
  const meanAbsoluteError =
    errors.reduce((prev, curr) => {
      return Math.abs(prev) + Math.abs(curr);
    }, 0) / count;
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
      key: TotalCohortSamples,
      label: localization.Interpret.Statistics.samples,
      stat: count
    },
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

const generateMulticlassStats: (outcomes: number[]) => ILabeledStatistic[] = (
  outcomes: number[]
): ILabeledStatistic[] => {
  const correctCount = outcomes.filter(
    (x) => x === MulticlassClassificationEnum.Correct
  ).length;
  const total = outcomes.length;
  return [
    {
      key: TotalCohortSamples,
      label: localization.Interpret.Statistics.samples,
      stat: total
    },
    {
      key: MulticlassClassificationMetrics.Accuracy,
      label: localization.Interpret.Statistics.accuracy,
      stat: correctCount / total
    }
  ];
};

export const generateMetrics: (
  jointDataset: JointDataset,
  selectionIndexes: number[][],
  modelType: ModelTypes,
  objectDetectionCache?: Map<string, [number, number, number]>,
  objectDetectionInputs?: [string, string, number],
  questionAnsweringCache?: QuestionAnsweringCacheType
) => ILabeledStatistic[][] = (
  jointDataset: JointDataset,
  selectionIndexes: number[][],
  modelType: ModelTypes,
  objectDetectionCache?: Map<string, [number, number, number]>,
  objectDetectionInputs?: [string, string, number],
  questionAnsweringCache?: QuestionAnsweringCacheType
): ILabeledStatistic[][] => {
  if (
    modelType === ModelTypes.ImageMultilabel ||
    modelType === ModelTypes.TextMultilabel
  ) {
    return generateMultilabelStats(jointDataset, selectionIndexes);
  }
  if (modelType === ModelTypes.QuestionAnswering && questionAnsweringCache) {
    return generateQuestionAnsweringStats(
      selectionIndexes,
      questionAnsweringCache
    );
  }
  const trueYs = jointDataset.unwrap(JointDataset.TrueYLabel);
  const predYs = jointDataset.unwrap(JointDataset.PredictedYLabel);
  if (modelType === ModelTypes.Regression) {
    const errors = jointDataset.unwrap(JointDataset.RegressionError);
    return selectionIndexes.map((selectionArray) => {
      const trueYSubset = selectionArray.map((i) => trueYs[i]);
      const predYSubset = selectionArray.map((i) => predYs[i]);
      const errorsSubset = selectionArray.map((i) => errors[i]);
      return generateRegressionStats(trueYSubset, predYSubset, errorsSubset);
    });
  }
  if (modelType === ModelTypes.ImageMulticlass) {
    return selectionIndexes.map((selectionArray) => {
      const trueYSubset = selectionArray.map((i) => trueYs[i]);
      const predYSubset = selectionArray.map((i) => predYs[i]);
      return generateImageStats(trueYSubset, predYSubset);
    });
  }
  if (
    modelType === ModelTypes.ObjectDetection &&
    objectDetectionCache &&
    objectDetectionInputs
  ) {
    return generateObjectDetectionStats(
      selectionIndexes,
      objectDetectionCache,
      objectDetectionInputs
    );
  }
  const outcomes = jointDataset.unwrap(JointDataset.ClassificationError);
  return selectionIndexes.map((selectionArray) => {
    const outcomeSubset = selectionArray.map((i) => outcomes[i]);
    if (IsBinary(modelType)) {
      return generateBinaryStats(outcomeSubset);
    }
    // modelType === ModelTypes.Multiclass
    return generateMulticlassStats(outcomeSubset);
  });
};
