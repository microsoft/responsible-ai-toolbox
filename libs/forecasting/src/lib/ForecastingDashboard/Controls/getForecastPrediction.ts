// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Cohort, JointDataset } from "@responsible-ai/core-ui";

export async function getForecastPrediction(
  cohort: Cohort,
  jointDataset: JointDataset,
  requestForecast:
    | ((request: any[], abortSignal: AbortSignal) => Promise<any[]>)
    | undefined
): Promise<number[] | undefined> {
  if (requestForecast === undefined) {
    return;
  }
  return await requestForecast(
    [
      Cohort.getLabeledFilters(cohort.filters, jointDataset),
      Cohort.getLabeledCompositeFilters(cohort.compositeFilters, jointDataset),
      []
    ],
    new AbortController().signal
  );
}
