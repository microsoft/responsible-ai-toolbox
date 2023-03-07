// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import {
  ILabeledStatistic,
  TotalCohortSamples
} from "../Interfaces/IStatistic";

import { JointDataset } from "./JointDataset";

export enum ObjectDetectionMetrics {
    MeanAveragePrecision = "meanAveragePrecision",
    AveragePrecision = "averagePrecision",
    AverageRecall = "averageRecall"
}

export const generateObjectDetectionStats: (
    jointDataset: JointDataset,
    selectionIndexes: number[][]
  ) => ILabeledStatistic[][] = (
    jointDataset: JointDataset,
    selectionIndexes: number[][]
  ): ILabeledStatistic[][] => {
    const numLabels = jointDataset.numLabels;
    return selectionIndexes.map((selectionArray) => {

        // TODO: replace placeholder values with flask endpoint calls to python backend.
        let meanAveragePrecision = 42;
        let averagePrecision = 42;
        let averageRecall = 42;

        return [
            {
              key: ObjectDetectionMetrics.MeanAveragePrecision,
              label: localization.Interpret.Statistics.meanAveragePrecision,
              stat: meanAveragePrecision
            },
            {
              key: ObjectDetectionMetrics.AveragePrecision,
              label: localization.Interpret.Statistics.averagePrecision,
              stat: averagePrecision
            },
            {
            key: ObjectDetectionMetrics.AverageRecall,
            label: localization.Interpret.Statistics.averageRecall,
              stat: averageRecall
            }
          ];
    })
  }