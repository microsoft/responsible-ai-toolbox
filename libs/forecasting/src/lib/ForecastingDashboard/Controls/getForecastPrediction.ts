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
  // Before sending the forecast request we need to convert
  // column names from Data# into the original labels.
  const labeledFilters = Cohort.getLabeledFilters(cohort.filters, jointDataset);
  const labeledCompositeFilters = Cohort.getLabeledCompositeFilters(
    cohort.compositeFilters,
    jointDataset
  );
  return await requestForecast(
    [
      labeledFilters,
      labeledCompositeFilters,
      transformation
        ? [
            transformation.operation.key,
            jointDataset.metaDict[transformation.feature.key].label,
            jointDataset.getRawValue(
              transformation.value,
              transformation.feature.key
            )
          ]
        : []
    ],
    new AbortController().signal
  );
}
