// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function isNumber(value: string): boolean {
  // explanation for the regex below:
  // ^\-? - optional negative sign
  // [0-9]* - any number of digits
  // ([0-9]\.?|\.?[0-9]) - either a digit followed by an optional decimal or a decimal followed by a digit
  // [0-9]*$ - any number of digits
  return new RegExp("^\-?[0-9]*([0-9]\.?|\.?[0-9])[0-9]*$").test(value);
}

export function mayBecomeNumber(value: string): boolean {
  // explanation for the regex below:
  // ^\-? - optional negative sign
  // [0-9]* - any number of digits
  // \.? - optional floating point
  // [0-9]*$ - any number of digits
  // This is a more lenient version of the above regex to allow for partially written numbers
  // such as "." or "-." or ""
  return new RegExp("^\-?[0-9]*\.?[0-9]*$").test(value);
}
