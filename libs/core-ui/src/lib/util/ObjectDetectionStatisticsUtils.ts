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
  selectionIndexes: number[][],
  objectDetectionCache: Map<string, [number, number, number]>,
  objectDetectionInputs: [string, string, number]
) => ILabeledStatistic[][] = (
  selectionIndexes: number[][],
  objectDetectionCache: Map<string, [number, number, number]>,
  objectDetectionInputs: [string, string, number]
): ILabeledStatistic[][] => {
  return selectionIndexes.map((selectionArray) => {
    const count = selectionArray.length;

    const key: [number[], string, string, number] = [
      selectionArray,
      objectDetectionInputs[0],
      objectDetectionInputs[1],
      objectDetectionInputs[2]
    ];
    const value = objectDetectionCache.get(key.toString());
    const stat = value ? value : [Number.NaN, Number.NaN, Number.NaN];

    return [
      {
        key: TotalCohortSamples,
        label: localization.Interpret.Statistics.samples,
        stat: count
      },
      {
        key: ObjectDetectionMetrics.MeanAveragePrecision,
        label: localization.Interpret.Statistics.meanAveragePrecision,
        stat: stat[0]
      },
      {
        key: ObjectDetectionMetrics.AveragePrecision,
        label: localization.Interpret.Statistics.averagePrecision,
        stat: stat[1]
      },
      {
        key: ObjectDetectionMetrics.AverageRecall,
        label: localization.Interpret.Statistics.averageRecall,
        stat: stat[2]
      }
    ];
  });
};
