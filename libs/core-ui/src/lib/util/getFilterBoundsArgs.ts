// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFilter } from "../Interfaces/IFilter";

import { IJointMeta } from "./JointDatasetUtils";

export function getFilterBoundsArgs(
  metaDict: IJointMeta,
  filter: IFilter
): string {
  if (metaDict?.treatAsCategorical && metaDict.sortedCategoricalValues) {
    return filter.arg
      .map((arg) => (metaDict.sortedCategoricalValues as string[])[arg])
      .join(", ");
  }
  return filter.arg.map((arg) => arg.toFixed(2)).join(", ");
}
