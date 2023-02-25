// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { isNumber, mayBecomeNumber } from "./isNumber";

describe("test is number", () => {
  it("should correctly identify numbers", () => {
    expect(isNumber("0")).toBe(true);
    expect(isNumber("1")).toBe(true);
    expect(isNumber("-1")).toBe(true);
    expect(isNumber("1.1")).toBe(true);
    expect(isNumber("-1.1")).toBe(true);
    expect(isNumber("1.23456789")).toBe(true);
    expect(isNumber("-1.23456789")).toBe(true);
    expect(isNumber("1.0")).toBe(true);
    expect(isNumber(".1")).toBe(true);
    expect(isNumber("-.1")).toBe(true);
    expect(isNumber("-")).toBe(false);
    expect(isNumber("1.")).toBe(true);
    expect(isNumber("-1.")).toBe(true);
    expect(isNumber(".")).toBe(false);
    expect(isNumber("-.")).toBe(false);
    expect(isNumber("abc")).toBe(false);
    expect(isNumber("1abc")).toBe(false);
    expect(isNumber("1..")).toBe(false);
    expect(isNumber("-1..")).toBe(false);
    expect(isNumber("-..1")).toBe(false);
  });
  it("should correctly identify strings that could turn into numbers", () => {
    expect(mayBecomeNumber("0")).toBe(true);
    expect(mayBecomeNumber("1")).toBe(true);
    expect(mayBecomeNumber("-1")).toBe(true);
    expect(mayBecomeNumber("1.1")).toBe(true);
    expect(mayBecomeNumber("-1.1")).toBe(true);
    expect(mayBecomeNumber("1.23456789")).toBe(true);
    expect(mayBecomeNumber("-1.23456789")).toBe(true);
    expect(mayBecomeNumber("1.0")).toBe(true);
    expect(mayBecomeNumber(".1")).toBe(true);
    expect(mayBecomeNumber("-.1")).toBe(true);
    expect(mayBecomeNumber("-")).toBe(true);
    expect(mayBecomeNumber("1.")).toBe(true);
    expect(mayBecomeNumber("-1.")).toBe(true);
    expect(mayBecomeNumber(".")).toBe(true);
    expect(mayBecomeNumber("-.")).toBe(true);
    expect(mayBecomeNumber("abc")).toBe(false);
    expect(mayBecomeNumber("1abc")).toBe(false);
    expect(mayBecomeNumber("1..")).toBe(false);
    expect(mayBecomeNumber("-1..")).toBe(false);
    expect(mayBecomeNumber("-..1")).toBe(false);
  });
});
