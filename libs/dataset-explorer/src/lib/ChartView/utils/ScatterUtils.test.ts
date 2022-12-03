// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getScatterSymbols } from "./ScatterUtils";

describe("ScatterUtils", () => {
  it("should generate correct symbols", () => {
    const expectedSymbols = [
      "circle",
      "square",
      "diamond",
      "triangle",
      "triangle-down",
      "circle",
      "square",
      "diamond",
      "triangle",
      "triangle-down",
      "circle",
      "square",
      "diamond",
      "triangle",
      "triangle-down"
    ];
    expect(getScatterSymbols()).toEqual(expectedSymbols);
  });
});
