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
  selectionIndexes: number[][],
  questionAnsweringCache: Map<
    string,
    [number, number, number, number, number, number]
  >
) => ILabeledStatistic[][] = (
  selectionIndexes: number[][],
  questionAnsweringCache: Map<
    string,
    [number, number, number, number, number, number]
  >
): ILabeledStatistic[][] => {
  return selectionIndexes.map((selectionArray) => {
    const count = selectionArray.length;

    const value = questionAnsweringCache.get(selectionArray.toString());
    const stat = value
      ? value
      : [
          Number.NaN,
          Number.NaN,
          Number.NaN,
          Number.NaN,
          Number.NaN,
          Number.NaN
        ];

    return [
      {
        key: TotalCohortSamples,
        label: localization.Interpret.Statistics.samples,
        stat: count
      },
      {
        key: QuestionAnsweringMetrics.ExactMatchRatio,
        label: localization.Interpret.Statistics.exactMatchRatio,
        stat: stat[0]
      },
      {
        key: QuestionAnsweringMetrics.F1Score,
        label: localization.Interpret.Statistics.f1Score,
        stat: stat[1]
      },
      {
        key: QuestionAnsweringMetrics.MeteorScore,
        label: localization.Interpret.Statistics.meteorScore,
        stat: stat[2]
      },
      {
        key: QuestionAnsweringMetrics.BleuScore,
        label: localization.Interpret.Statistics.bleuScore,
        stat: stat[3]
      },
      {
        key: QuestionAnsweringMetrics.BertScore,
        label: localization.Interpret.Statistics.bertScore,
        stat: stat[4]
      },
      {
        key: QuestionAnsweringMetrics.RougeScore,
        label: localization.Interpret.Statistics.rougeScore,
        stat: stat[5]
      }
    ];
  });
};
