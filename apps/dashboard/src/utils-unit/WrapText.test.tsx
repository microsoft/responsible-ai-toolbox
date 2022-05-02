// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { wrapText } from "@responsible-ai/model-assessment";

describe("wrapTextDefaultOptions", () => {
  it.each`
    input                                                                                                         | expectedResult
    ${""}                                                                                                         | ${""}
    ${"a"}                                                                                                        | ${"a"}
    ${"This is a test description that's meant to be wrapped"}                                                    | ${"This is a test description that's meant<br /> to be wrapped"}
    ${"Not this one, though!"}                                                                                    | ${"Not this one, though!"}
    ${"Thisone,ontheotherhand,doesn'treallyofferanywhitespacewrapoptionsoitjustwraps"}                            | ${"Thisone,ontheotherhand,doesn'treallyoffe<br />ranywhitespacewrapoptionsoitjustwraps"}
    ${"Then again, some descriptions are so long that we really need to cut them off to avoid overlapping text."} | ${"Then again, some descriptions are so<br /> long that we really need to cut them..."}
  `(
    "should wrap text as expected at a max of 2 lines (default)",
    ({ input, expectedResult }) => {
      expect(wrapText(input)).toBe(expectedResult);
    }
  );
});

describe("wrapTextCustomOptionsSingleLine", () => {
  it.each`
    input                                                                                                         | expectedResult
    ${""}                                                                                                         | ${""}
    ${"a"}                                                                                                        | ${"a"}
    ${"This is a test description that's meant to be wrapped"}                                                    | ${"This is a test description that's mea..."}
    ${"Not this one, though!"}                                                                                    | ${"Not this one, though!"}
    ${"Thisone,ontheotherhand,doesn'treallyofferanywhitespacewrapoptionsoitjustwraps"}                            | ${"Thisone,ontheotherhand,doesn'treallyo..."}
    ${"Then again, some descriptions are so long that we really need to cut them off to avoid overlapping text."} | ${"Then again, some descriptions are so ..."}
  `("should limit text to 1 line", ({ input, expectedResult }) => {
    expect(wrapText(input, 40, 1)).toBe(expectedResult);
  });
});

describe("wrapTextCustomOptionsThreeLines", () => {
  it.each`
    input                                                                                                                                   | expectedResult
    ${""}                                                                                                                                   | ${""}
    ${"a"}                                                                                                                                  | ${"a"}
    ${"This is a test description that's meant to be wrapped"}                                                                              | ${"This is a test description that's meant<br /> to be wrapped"}
    ${"Not this one, though!"}                                                                                                              | ${"Not this one, though!"}
    ${"Thisone,ontheotherhand,doesn'treallyofferanywhitespacewrapoptionsoitjustwraps"}                                                      | ${"Thisone,ontheotherhand,doesn'treallyoffe<br />ranywhitespacewrapoptionsoitjustwraps"}
    ${"Then again, some descriptions are so long that we really need to cut them off to avoid overlapping text."}                           | ${"Then again, some descriptions are so<br /> long that we really need to cut them<br /> off to avoid overlapping text."}
    ${"If we only wrap text after three lines it may mean that only the very very long text is really wrapped and anything shorter isn't."} | ${"If we only wrap text after three lines<br /> it may mean that only the very very<br /> long text is really wrapped and anyt..."}
  `(
    "should wrap text as expected at a max of 3 lines",
    ({ input, expectedResult }) => {
      expect(wrapText(input, 40, 3)).toBe(expectedResult);
    }
  );
});
