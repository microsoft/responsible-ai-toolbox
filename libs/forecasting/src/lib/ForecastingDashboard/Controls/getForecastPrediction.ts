// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Cohort, JointDataset } from "@responsible-ai/core-ui";

import { Transformation } from "../Interfaces/Transformation";

export async function getForecastPrediction(
  cohort: Cohort,
  jointDataset: JointDataset,
  requestForecast:
    | ((request: any[], abortSignal: AbortSignal) => Promise<any[]>)
    | undefined,
  transformation?: Transformation
): Promise<number[] | undefined> {
  if (requestForecast === undefined) {
    return;
  }
  return await requestForecast(
    [
      Cohort.getLabeledFilters(cohort.filters, jointDataset),
      Cohort.getLabeledCompositeFilters(cohort.compositeFilters, jointDataset),
      transformation
        ? [
            transformation.operation.key,
            transformation.feature.key,
            transformation.value
          ]
        : []
    ],
    new AbortController().signal
  );
}
