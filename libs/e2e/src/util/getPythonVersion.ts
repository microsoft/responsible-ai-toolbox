// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import process from "process";

export function getPythonVersion(): string {
  const version = process.version;
  const match = version.match(/^v(\d+\.\d+)/);
  if (match) {
    return match[1];
  }
  return "";
}
