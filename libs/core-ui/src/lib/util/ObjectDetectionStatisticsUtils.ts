// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import {
  ILabeledStatistic,
  TotalCohortSamples
} from "../Interfaces/IStatistic";

export enum ObjectDetectionMetrics {
  MeanAveragePrecision = "meanAveragePrecision",
  AveragePrecision = "averagePrecision",
  AverageRecall = "averageRecall"
}

export const generateObjectDetectionStats: (
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
        key: ObjectDetectionMetrics.MeanAveragePrecision,
        label: localization.Interpret.Statistics.meanAveragePrecision,
        stat: 0
      },
      {
        key: ObjectDetectionMetrics.AveragePrecision,
        label: localization.Interpret.Statistics.averagePrecision,
        stat: 0
      },
      {
        key: ObjectDetectionMetrics.AverageRecall,
        label: localization.Interpret.Statistics.averageRecall,
        stat: 0
      }
    ];
  });
};
