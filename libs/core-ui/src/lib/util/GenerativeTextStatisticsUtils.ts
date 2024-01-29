// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import {
  ILabeledStatistic,
  TotalCohortSamples
} from "../Interfaces/IStatistic";

import { QuestionAnsweringMetrics } from "./QuestionAnsweringStatisticsUtils";

export enum GenerativeTextMetrics {
  Coherence = "coherence",
  Fluency = "fluency",
  Equivalence = "equivalence",
  Groundedness = "groundedness",
  Relevance = "relevance"
}

export const generateGenerativeTextStats: (
  selectionIndexes: number[][],
  generativeTextCache: Map<string, Map<string, number>>
) => ILabeledStatistic[][] = (
  selectionIndexes: number[][],
  generativeTextCache: Map<string, Map<string, number>>
): ILabeledStatistic[][] => {
  return selectionIndexes.map((selectionArray) => {
    const count = selectionArray.length;

    const value = generativeTextCache.get(selectionArray.toString());
    const stat: Map<string, number> = value ? value : new Map<string, number>();

    const stats = [
      {
        key: TotalCohortSamples,
        label: localization.Interpret.Statistics.samples,
        stat: count
      }
    ];
    for (const [key, value] of stat.entries()) {
      let label = "";
      switch (key) {
        case GenerativeTextMetrics.Coherence:
          label = localization.Interpret.Statistics.coherence;
          break;
        case GenerativeTextMetrics.Fluency:
          label = localization.Interpret.Statistics.fluency;
          break;
        case GenerativeTextMetrics.Equivalence:
          label = localization.Interpret.Statistics.equivalence;
          break;
        case GenerativeTextMetrics.Groundedness:
          label = localization.Interpret.Statistics.groundedness;
          break;
        case GenerativeTextMetrics.Relevance:
          label = localization.Interpret.Statistics.relevance;
          break;
        case QuestionAnsweringMetrics.ExactMatchRatio:
          label = localization.Interpret.Statistics.exactMatchRatio;
          break;
        case QuestionAnsweringMetrics.F1Score:
          label = localization.Interpret.Statistics.f1Score;
          break;
        case QuestionAnsweringMetrics.MeteorScore:
          label = localization.Interpret.Statistics.meteorScore;
          break;
        case QuestionAnsweringMetrics.BleuScore:
          label = localization.Interpret.Statistics.bleuScore;
          break;
        case QuestionAnsweringMetrics.BertScore:
          label = localization.Interpret.Statistics.bertScore;
          break;
        case QuestionAnsweringMetrics.RougeScore:
          label = localization.Interpret.Statistics.rougeScore;
          break;
        default:
          break;
      }
      stats.push({
        key,
        label,
        stat: value
      });
    }
    return stats;
  });
};
