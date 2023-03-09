// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import {
  ILabeledStatistic,
  TotalCohortSamples
} from "../Interfaces/IStatistic";

import { JointDataset } from "./JointDataset";

export enum QuestionAnsweringMetrics {
  BleuScore = "bleuScore",
  ExactMatchRatio = "exactMatchRatio",
  F1Score = "f1Score",
  MeteorScore = "meteorScore",
  RougeScore = "rougeScore"
  F1Score = "f1Score",
  MeteorScore = "meteorScore",
  RougeScore = "rougeScore"
}

function getf1Score(actual: string[], predicted: string[]): number {
  const truePositives = actual.filter((value) =>
    predicted.includes(value)
  ).length;
  const falsePositives = predicted.filter(
    (value) => !actual.includes(value)
  ).length;
  const falseNegatives = actual.filter(
    (value) => !predicted.includes(value)
  ).length;

  const precision = truePositives / (truePositives + falsePositives);
  const recall = truePositives / (truePositives + falseNegatives);

  return 2 * ((precision * recall) / (precision + recall));
}

export const generateQuestionAnsweringStats: (
  jointDataset: JointDataset,
  selectionIndexes: number[][]
) => ILabeledStatistic[][] = (
  jointDataset: JointDataset,
  selectionIndexes: number[][]
): ILabeledStatistic[][] => {
  return selectionIndexes.map((selectionArray) => {
    const matchingLabels = [];
    const count = selectionArray.length;
    let trueYs: string[] = [];
    let predYs: string[] = [];
    if (jointDataset.strDataDict) {
      trueYs = jointDataset.strDataDict.map(
        (row) => row[JointDataset.TrueYLabel]
      );
      predYs = jointDataset.strDataDict.map(
        (row) => row[JointDataset.PredictedYLabel]
      );
    }

    const trueYSubset = selectionArray.map((i) => trueYs[i]);
    const predYSubset = selectionArray.map((i) => predYs[i]);
    matchingLabels.push(
      trueYSubset.filter((trueY, index) => trueY === predYSubset[index]).length
    );

    const meteorScore = 0;
    const rougeScore = 0;
    const bleuScore = 0;
    const sum = matchingLabels.reduce((prev, curr) => prev + curr, 0);
    const exactMatchRatio = sum / selectionArray.length;

    const f1Score = getf1Score(
      jointDataset.unwrap(JointDataset.TrueYLabel),
      jointDataset.unwrap(JointDataset.PredictedYLabel)
    );

    const meteorScore = 0;
    const rougeScore = 0;
    const bleuScore = 0;

    return [
      {
        key: TotalCohortSamples,
        label: localization.Interpret.Statistics.samples,
        stat: count
      },
      {
        key: QuestionAnsweringMetrics.ExactMatchRatio,
        label: localization.Interpret.Statistics.exactMatchRatio,
        stat: exactMatchRatio
      },
      {
        key: QuestionAnsweringMetrics.F1Score,
        label: localization.Interpret.Statistics.f1Score,
        stat: f1Score
      },
      {
        key: QuestionAnsweringMetrics.MeteorScore,
        label: localization.Interpret.Statistics.meteorScore,
        stat: meteorScore
      },
      {
        key: QuestionAnsweringMetrics.BleuScore,
        label: localization.Interpret.Statistics.bleuScore,
        stat: bleuScore
      },
      {
        key: QuestionAnsweringMetrics.RougeScore,
        label: localization.Interpret.Statistics.rougeScore,
        stat: rougeScore
      }
    ];
  });
};
