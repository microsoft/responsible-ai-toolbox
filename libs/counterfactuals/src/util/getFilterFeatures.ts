// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICounterfactualData } from "@responsible-ai/core-ui";
import { toLower } from "lodash";

import { getSortedFeatureNames } from "./getSortedFeatureNames";

export function getFilterFeatures(
  data: ICounterfactualData | undefined,
  selectedIndex: number,
  sortFeatures: boolean,
  filterText: string | undefined
): string[] {
  const allFeatures = getSortedFeatureNames(data, selectedIndex, sortFeatures);
  const invalidInput =
    filterText === undefined || filterText === null || !/\S/.test(filterText);
  const filtered = invalidInput
    ? allFeatures
    : allFeatures.filter((f) => toLower(f).includes(toLower(filterText)));
  return filtered;
}
