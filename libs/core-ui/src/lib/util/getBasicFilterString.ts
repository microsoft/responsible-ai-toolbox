// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FilterMethods, IFilter } from "../Interfaces/IFilter";

import { getFilterBoundsArgs } from "./getFilterBoundsArgs";
import { JointDataset } from "./JointDataset";

export function getBasicFilterString(
  filters: IFilter[],
  jointDataset: JointDataset
): string[] {
  return filters
    .filter((item) => item)
    .map((filter: IFilter): string => {
      let method = "";
      const metaDict = jointDataset.metaDict[filter.column];
      const label = metaDict.label;
      if (filter.method === FilterMethods.InTheRangeOf) {
        const arg0 = filter.arg[0].toFixed(2);
        const arg1 = filter.arg[1].toFixed(2);
        return `${label} in (${arg0}, ${arg1}]`;
      }
      if (filter.method === FilterMethods.Includes) {
        const args = getFilterBoundsArgs(metaDict, filter);
        return `${label} in ${args}`;
      }
      if (filter.method === FilterMethods.Excludes) {
        const args = getFilterBoundsArgs(metaDict, filter);
        return `${label} not in ${args}`;
      }
      if (filter.method === FilterMethods.Equal) {
        method = "==";
        if (metaDict?.treatAsCategorical && metaDict.sortedCategoricalValues) {
          const catArg = (metaDict.sortedCategoricalValues as string[])[
            filter.arg[0]
          ];
          return `${label} ${method} ${catArg}`;
        }
      } else if (filter.method === FilterMethods.GreaterThan) {
        method = ">";
      } else if (filter.method === FilterMethods.GreaterThanEqualTo) {
        method = ">=";
      } else if (filter.method === FilterMethods.LessThan) {
        method = "<";
      } else if (filter.method === FilterMethods.LessThanEqualTo) {
        method = "<=";
      }
      return `${label} ${method} ${filter.arg[0].toFixed(2)}`;
    });
}
