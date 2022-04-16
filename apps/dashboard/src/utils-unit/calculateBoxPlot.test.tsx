// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { calculateBoxPlotData, getPercentile } from "@responsible-ai/core-ui";

describe("calculateBoxPlot", () => {
  it.each`
    input                      | expectedResult
    ${[0]}                     | ${{ high: 0, low: 0, q1: 0, q3: 0, median: 0 }}
    ${[1]}                     | ${{ high: 1, low: 1, q1: 1, q3: 1, median: 1 }}
    ${[100000]}                | ${{ high: 100000, low: 100000, q1: 100000, q3: 100000, median: 100000 }}
    ${[0, 1]}                  | ${{ high: 1, low: 0, q1: 0, q3: 1, median: 0.5 }}
    ${[1, 0]}                  | ${{ high: 1, low: 0, q1: 0, q3: 1, median: 0.5 }}
    ${[1, 0, 2]}               | ${{ high: 2, low: 0, q1: 0, q3: 2, median: 1 }}
    ${[10, 5, -10, -5, 2, -2]} | ${{ high: 10, low: -10, q1: -5, q3: 5, median: 0 }}
  `("should return correct box values", ({ input, expectedResult }) => {
    const boxPlotData = calculateBoxPlotData(input)!;
    expect(boxPlotData.high).toEqual(expectedResult.high);
    expect(boxPlotData.q3).toEqual(expectedResult.q3);
    expect(boxPlotData.median).toEqual(expectedResult.median);
    expect(boxPlotData.q1).toEqual(expectedResult.q1);
    expect(boxPlotData.low).toEqual(expectedResult.low);
  });
});

describe("calculateBoxPlotEmptyArray", () => {
  it("should return undefined", () => {
    expect(calculateBoxPlotData([])).toBe(undefined);
  });
});

describe("calculateBoxPlotWithIndex", () => {
  it("should return index as x", () => {
    const index = 15
    expect(calculateBoxPlotData([1], index)!.x!).toBe(index);
  });
});

describe("calculatePercentile", () => {
  it.each`
    array           | percentile | expectedResult
    ${[0]}          | ${1}       | ${0}
    ${[0]}          | ${99}      | ${0}
    ${[0]}          | ${50}      | ${0}
    ${[0]}          | ${33}      | ${0}
    ${[0, 1]}       | ${1}       | ${0}
    ${[0, 1]}       | ${49}      | ${0}
    ${[0, 1]}       | ${50}      | ${0.5}
    ${[0, 1]}       | ${51}      | ${1}
    ${[0, 1]}       | ${99}      | ${1}
    ${[1, 2, 3, 4]} | ${5}       | ${1}
    ${[1, 2, 3, 4]} | ${20}      | ${1}
    ${[1, 2, 3, 4]} | ${40}      | ${2}
    ${[1, 2, 3, 4]} | ${70}      | ${3}
    ${[1, 2, 3, 4]} | ${99}      | ${4}
    ${[1, 2, 3, 4]} | ${45}      | ${2}
    ${[1, 2, 3, 4]} | ${50}      | ${2.5}
    ${[1, 2, 3, 4]} | ${55}      | ${3}
    ${[1, 2, 3, 4]} | ${75}      | ${3.5}
  `(
    "should return correct percentile values",
    ({ array, percentile, expectedResult }) => {
      expect(getPercentile(array, percentile)).toEqual(expectedResult);
    }
  );
});

describe("calculatePercentileEmptyArray", () => {
  it("should return undefined", () => {
    expect(getPercentile([], 50)).toBe(undefined);
  });
});
