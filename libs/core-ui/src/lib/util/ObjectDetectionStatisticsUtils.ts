// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModelAssessmentContext } from "@responsible-ai/core-ui";
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
  selectionIndexes: number[][],
  requestObjectDetectionMetrics?: IModelAssessmentContext["requestObjectDetectionMetrics"],
  objectDetectionState?: [string, string, number, any]
) => ILabeledStatistic[][] = (
  jointDataset: JointDataset,
  selectionIndexes: number[][],
  requestObjectDetectionMetrics?: IModelAssessmentContext["requestObjectDetectionMetrics"],
  objectDetectionState?: [string, string, number, any]
): ILabeledStatistic[][] => {
  const numLabels = jointDataset.numLabels;
  return selectionIndexes.map((selectionArray) => {
    const count = selectionArray.length;

    // Placeholder values without attached compute.
    let meanAveragePrecision = numLabels;
    let averagePrecision = numLabels;
    let averageRecall = numLabels;

    // checks for attached compute
    if (requestObjectDetectionMetrics && objectDetectionState) {
      requestObjectDetectionMetrics(
        objectDetectionState[0],
        objectDetectionState[1],
        objectDetectionState[2],
        new AbortController().signal
      ).then(
        (result) => {
          [meanAveragePrecision, averagePrecision, averageRecall] = result as number[];

          // set state

          console.log(meanAveragePrecision);

          // TODO: call method from parent to trigger state update to show value on UI
          // (await involves adding async all the way up ... complex)

          let updatedMetricStats = [
            {
              key: TotalCohortSamples,
              label: localization.Interpret.Statistics.samples,
              stat: count
            },
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

          // ModelOverview setState
          objectDetectionState[3]({
            datasetCohortLabeledStatistics: updatedMetricStats
          });

          return updatedMetricStats;
        }
      )
    }

    console.log(meanAveragePrecision);

    return [
      {
        key: TotalCohortSamples,
        label: localization.Interpret.Statistics.samples,
        stat: count
      },
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
  });
};
