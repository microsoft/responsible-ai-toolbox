// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";

export function toScientific(item: { [key: string]: any }): {
  [key: string]: any;
} {
  const copy = _.cloneDeep(item);
  Object.keys(copy).forEach((k) => {
    const isFloat = typeof copy[k] === "number" && copy[k] % 1 !== 0;
    if (isFloat) {
      copy[k] = copy[k].toExponential(3);
    }
  });
  return copy;
}
