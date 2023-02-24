// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function isValidTransformationName(name: string): boolean {
  // explanation for the regex below:
  // ^[a-zA-Z0-9_]+ - start with alphanumeric character
  // [a-zA-Z0-9_\-\s]*$ - continue with any number of alphanumeric characters, underscores, dashes, or spaces
  return new RegExp("^[a-zA-Z0-9]+[a-zA-Z0-9_\\-\\s]*$").test(name);
}