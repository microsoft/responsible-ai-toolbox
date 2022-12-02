// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function generateRoute(params: readonly string[]): string {
  return params.map((p) => `/:${p}([\\d\\s\\w-%]*)?`).join("");
}
