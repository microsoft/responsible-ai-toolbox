// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { isValidTransformationName } from "./isValidTransformationName";

describe("test is valid transformation name", () => {
  it("should identify correct names", () => {
    expect(isValidTransformationName("g")).toBe(true);
    expect(isValidTransformationName("1")).toBe(true);
    expect(isValidTransformationName("M")).toBe(true);
    expect(isValidTransformationName("good")).toBe(true);
    expect(isValidTransformationName("1 transformation is good")).toBe(true);
    expect(isValidTransformationName("Mild increase in 1 feature")).toBe(true);
    expect(isValidTransformationName("g_add_1")).toBe(true);
    expect(isValidTransformationName("6_sub_g")).toBe(true);
    expect(isValidTransformationName("M_mul_5")).toBe(true);
    expect(isValidTransformationName("g-2")).toBe(true);
    expect(isValidTransformationName("1-0")).toBe(true);
    expect(isValidTransformationName("M-9")).toBe(true);
    expect(isValidTransformationName("g_a bc-7")).toBe(true);
    expect(isValidTransformationName("1-r TP_q")).toBe(true);
    expect(isValidTransformationName("M_345 p-y")).toBe(true);
  });
  it("should identify incorrect names", () => {
    expect(isValidTransformationName("")).toBe(false);
    expect(isValidTransformationName(" ")).toBe(false);
    expect(isValidTransformationName(" g")).toBe(false);
    expect(isValidTransformationName(" 1")).toBe(false);
    expect(isValidTransformationName(" M")).toBe(false);
    expect(isValidTransformationName("_")).toBe(false);
    expect(isValidTransformationName("_g")).toBe(false);
    expect(isValidTransformationName("_1")).toBe(false);
    expect(isValidTransformationName("_M")).toBe(false);
    expect(isValidTransformationName("-")).toBe(false);
    expect(isValidTransformationName("-g")).toBe(false);
    expect(isValidTransformationName("-1")).toBe(false);
    expect(isValidTransformationName("-M")).toBe(false);
    expect(isValidTransformationName("*")).toBe(false);
    expect(isValidTransformationName("abcde*fg")).toBe(false);
    expect(isValidTransformationName("This is a name, but it won't pass.")).toBe(false);
    expect(isValidTransformationName("ABCDE&FG")).toBe(false);
    expect(isValidTransformationName("a<b")).toBe(false);
    expect(isValidTransformationName("c>d")).toBe(false);
    expect(isValidTransformationName("e%f")).toBe(false);
    expect(isValidTransformationName("g$h")).toBe(false);
    expect(isValidTransformationName("i#j")).toBe(false);
    expect(isValidTransformationName("k@l")).toBe(false);
    expect(isValidTransformationName("m/n")).toBe(false);
    expect(isValidTransformationName("o\\p")).toBe(false);
  });  
});