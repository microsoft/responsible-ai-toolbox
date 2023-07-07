// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { binarizeData, calculatePerClassROCData } from "./calculateAUCData";

describe("Test binarizeData", () => {
  it("should binarize numbers", () => {
    const result = binarizeData([1, 3, 4, 0], [0, 1, 2, 3, 4]);
    expect(result).toEqual([
      [0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0]
    ]);
  });
  it("should binarize strings", () => {
    const result = binarizeData(
      ["one", "two", "three"],
      ["three", "one", "two"]
    );
    expect(result).toEqual([
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 0]
    ]);
  });
  it("should binarize binary data", () => {
    const result = binarizeData([1, 0, 1, 0], [0, 1]);
    expect(result).toEqual([
      [0, 1],
      [1, 0],
      [0, 1],
      [1, 0]
    ]);
  });
});
describe("Test calculatePerClassROCData", () => {
  it("generate x,y data corresponding to fpr and tpr respectively", () => {
    const result = calculatePerClassROCData(
      [0.33, 0.32, 0.34, 0.29, 0.12, 0.41, 0.4, 0.39],
      [0, 1, 1, 0, 1, 0, 0, 0]
    );
    expect(result).toEqual({
      points: [
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 1, y: 0.6666666666666666 },
        { x: 0.8, y: 0.6666666666666666 },
        { x: 0.8, y: 0.6666666666666666 },
        { x: 0.8, y: 0.6666666666666666 },
        { x: 0.8, y: 0.3333333333333333 },
        { x: 0.6, y: 0.3333333333333333 },
        { x: 0.6, y: 0 },
        { x: 0.6, y: 0 },
        { x: 0.6, y: 0 },
        { x: 0.6, y: 0 },
        { x: 0.6, y: 0 },
        { x: 0.4, y: 0 },
        { x: 0.2, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ]
    });
  });
});
