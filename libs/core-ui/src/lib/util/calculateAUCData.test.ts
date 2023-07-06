// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { binarizeData } from "./calculateAUCData";

describe("Test binarizeData", () => {
  it("should binarize numbers", () => {
    const result = binarizeData([1, 3, 4, 0], [0, 1, 2, 3, 4]);
    expect(result).toEqual([[]]);
  });
  it("should binarize strings", () => {
    const result = binarizeData(
      ["one", "two", "three"],
      ["three", "one", "two"]
    );
    expect(result).toEqual([[]]);
  });
  it("should binarize binary data", () => {
    const result = binarizeData([1, 0, 1, 0], [0, 1]);
    expect(result).toEqual([[]]);
  });
});
