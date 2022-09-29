// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";

export function stringFormat(
  str: string,
  mapping: _.Dictionary<string>
): string {
  return _.replace(str, /{{|}}|{(\w+)}/g, (match, key) => {
    if (match === "{{") {
      return "{";
    }
    if (match === "}}") {
      return "}";
    }
    return mapping[key];
  });
}
