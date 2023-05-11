// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import {
  ILabeledStatistic,
  TotalCohortSamples
} from "../Interfaces/IStatistic";

export enum QuestionAnsweringMetrics {
  BleuScore = "bleuScore",
  BertScore = "bertScore",
  ExactMatchRatio = "exactMatchRatio",
  F1Score = "f1Score",
  MeteorScore = "meteorScore",
  RougeScore = "rougeScore"
}

export const generateQuestionAnsweringStats: (
  selectionIndexes: number[][]
) => ILabeledStatistic[][] = (
  selectionIndexes: number[][]
): ILabeledStatistic[][] => {
  return selectionIndexes.map((selectionArray) => {
    const count = selectionArray.length;

    return [
      {
        key: TotalCohortSamples,
        label: localization.Interpret.Statistics.samples,
        stat: count
      },
      {
        key: QuestionAnsweringMetrics.ExactMatchRatio,
        label: localization.Interpret.Statistics.exactMatchRatio,
        stat: Number.NaN
      },
      {
        key: QuestionAnsweringMetrics.F1Score,
        label: localization.Interpret.Statistics.f1Score,
        stat: Number.NaN
      },
      {
        key: QuestionAnsweringMetrics.MeteorScore,
        label: localization.Interpret.Statistics.meteorScore,
        stat: Number.NaN
      },
      {
        key: QuestionAnsweringMetrics.BleuScore,
        label: localization.Interpret.Statistics.bleuScore,
        stat: Number.NaN
      },
      {
        key: QuestionAnsweringMetrics.BertScore,
        label: localization.Interpret.Statistics.bertScore,
        stat: Number.NaN
      },
      {
        key: QuestionAnsweringMetrics.RougeScore,
        label: localization.Interpret.Statistics.rougeScore,
        stat: Number.NaN
      }
    ];
  });
};
