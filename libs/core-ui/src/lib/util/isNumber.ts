// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function isNumber(value: string): boolean {
  // explanation for the regex below:
  // ^\-? - optional negative sign
  // \\d* - any number of digits
  // (\\d\.?|\.?\\d) - either a digit followed by an optional decimal or a decimal followed by a digit
  // \\d*$ - any number of digits
  return new RegExp("^-?\\d*(\\d.?|.?\\d)\\d*$").test(value);
}

export function mayBecomeNumber(value: string): boolean {
  // explanation for the regex below:
  // ^\-? - optional negative sign
  // \\d* - any number of digits
  // \.? - optional floating point
  // \\d*$ - any number of digits
  // This is a more lenient version of the above regex to allow for partially written numbers
  // such as "." or "-." or ""
  return new RegExp("^-?\\d*.?\\d*$").test(value);
}
