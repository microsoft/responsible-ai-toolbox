// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getScatterSymbols(): string[] {
  const symbols = [];
  for (let i = 0; i < 3; i++) {
    symbols.push("circle", "square", "diamond", "triangle", "triangle-down");
  }
  return symbols;
}
