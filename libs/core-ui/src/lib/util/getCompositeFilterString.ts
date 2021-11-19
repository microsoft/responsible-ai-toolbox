// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICompositeFilter,
  IFilter,
  JointDataset
} from "@responsible-ai/core-ui";

import { getBasicFilterString } from "./getBasicFilterString";

export function getCompositeFilterString(
  compositeFilters: ICompositeFilter[],
  jointDataset: JointDataset
): string[] {
  return compositeFilters.map((compositeFilter: ICompositeFilter): string => {
    if (compositeFilter.method) {
      return getBasicFilterString(
        [compositeFilter as IFilter],
        jointDataset
      )[0];
    }
    const cohortCompositeFiltersStrings = getCompositeFilterString(
      compositeFilter.compositeFilters,
      jointDataset
    );
    if (cohortCompositeFiltersStrings.length === 1) {
      return cohortCompositeFiltersStrings[0];
    }
    return cohortCompositeFiltersStrings
      .map(
        (cohortCompositeFiltersString) => `(${cohortCompositeFiltersString})`
      )
      .join(` ${compositeFilter.operation} `);
  });
}
