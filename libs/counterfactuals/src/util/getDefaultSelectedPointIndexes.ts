// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Cohort, JointDataset } from "@responsible-ai/core-ui";

export function getDefaultSelectedPointIndexes(cohort: Cohort): number[] {
  const indexes = cohort.unwrap(JointDataset.IndexLabel);
  if (indexes.length > 0) {
    return [indexes[0]];
  }
  return [];
}
