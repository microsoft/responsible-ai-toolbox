// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { stringFormat } from "./stringFormat";

describe("stringFormat", () => {
  it("should format", () => {
    expect(stringFormat("We have {items} items", { items: "5" })).toBe(
      "We have 5 items"
    );
  });

  it("should encode", () => {
    expect(
      stringFormat("We have {items} items {{brackets}} {{{dot}}}", {
        dot: ".",
        items: "5"
      })
    ).toBe("We have 5 items {brackets} {.}");
  });
});
