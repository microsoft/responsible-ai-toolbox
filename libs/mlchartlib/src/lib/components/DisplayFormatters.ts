// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";
import moment from "moment";

export function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (!value) {
    return "";
  }
  if (_.isDate(value)) {
    return moment(value).format();
  }
  if (!_.isNaN(_.toNumber(value))) {
    const numericalVal = _.toNumber(value);
    if (_.isInteger(numericalVal)) {
      return numericalVal.toString();
    }
    return numericalVal.toPrecision(4);
  }
  if (_.isArray(value)) {
    return `vaector[${value.length}]`;
  }
  return JSON.stringify(value);
}
