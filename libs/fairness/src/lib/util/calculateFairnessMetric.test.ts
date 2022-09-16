// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { calculateFairnessMetric } from "./calculateFairnessMetric";
import { FairnessModes } from "./FairnessMetrics";

const closeTo = (
  expected: number,
  precision = 2
): { asymmetricMatch: (actual: number) => boolean } => ({
  asymmetricMatch: (actual: number): boolean =>
    Math.abs(expected - actual) < Math.pow(10, -precision) / 2
});
describe("calculateFairnessMetric", () => {
  it("should return NaN for no values", () => {
    const mockValue = {
      bins: [],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Difference);
    const expectedResult = {
      overall: Number.NaN
    };
    expect(result).toEqual(expectedResult);
  });
  it("should return NaN for invalid FairnessMode", () => {
    const mockValue = {
      bins: [],
      global: 0.5
    };
    const result = calculateFairnessMetric(
      mockValue,
      "invalid" as FairnessModes.Max
    );
    const expectedResult = {
      overall: Number.NaN
    };
    expect(result).toEqual(expectedResult);
  });
  it("should calculate difference without binBounds correctly", () => {
    const mockValue = {
      bins: [0.5, 0.2],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Difference);
    const expectedResult = {
      overall: 0.3
    };
    expect(result).toEqual(expectedResult);
  });
  it("should return only overall result if binBounds falsely", () => {
    const mockValue = {
      binBounds: [],
      bins: [0.3, 0.7],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Difference);
    const expectedResult = {
      overall: closeTo(0.4)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate difference (with overlap) correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.25, upper: 0.55 },
        { lower: 0.45, upper: 0.75 }
      ],
      bins: [0.3, 0.7],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Difference);
    const expectedResult = {
      bounds: { lower: 0, upper: closeTo(0.5) },
      overall: closeTo(0.4)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate difference (with overlap and reverse order) correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.45, upper: 0.75 },
        { lower: 0.25, upper: 0.55 }
      ],
      bins: [0.7, 0.3],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Difference);
    const expectedResult = {
      bounds: { lower: 0, upper: closeTo(0.5) },
      overall: closeTo(0.4)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate difference (with complete overlap) correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.2, upper: 0.8 },
        { lower: 0.5, upper: 0.7 }
      ],
      bins: [0.5, 0.6],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Difference);
    const expectedResult = {
      bounds: { lower: 0, upper: closeTo(0.5) },
      overall: closeTo(0.1)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate difference (with complete overlap and reversed order) correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.5, upper: 0.7 },
        { lower: 0.2, upper: 0.8 }
      ],
      bins: [0.5, 0.6],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Difference);
    const expectedResult = {
      bounds: { lower: 0, upper: closeTo(0.5) },
      overall: closeTo(0.1)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate difference (without overlap) correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.25, upper: 0.35 },
        { lower: 0.65, upper: 0.75 }
      ],
      bins: [0.3, 0.7],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Difference);
    const expectedResult = {
      bounds: { lower: closeTo(0.3), upper: closeTo(0.5) },
      overall: closeTo(0.4)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate difference (without overlap and reverse order) correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.65, upper: 0.75 },
        { lower: 0.25, upper: 0.35 }
      ],
      bins: [0.7, 0.3],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Difference);
    const expectedResult = {
      bounds: { lower: closeTo(0.3), upper: closeTo(0.5) },
      overall: closeTo(0.4)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate difference with 3+ groups correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.25, upper: 0.35 },
        { lower: 0.65, upper: 0.75 },
        { lower: 0.45, upper: 0.55 }
      ],
      bins: [0.3, 0.7, 0.5],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Difference);
    const expectedResult = {
      bounds: { lower: closeTo(0.3), upper: closeTo(0.5) },
      overall: closeTo(0.4)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate difference with 3+ groups correctly (permuted order)", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.45, upper: 0.55 },
        { lower: 0.25, upper: 0.35 },
        { lower: 0.65, upper: 0.75 }
      ],
      bins: [0.5, 0.3, 0.7],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Difference);
    const expectedResult = {
      bounds: { lower: closeTo(0.3), upper: closeTo(0.5) },
      overall: closeTo(0.4)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate difference with 3+ groups correctly (with overlap)", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.45, upper: 0.7 },
        { lower: 0.25, upper: 0.35 },
        { lower: 0.65, upper: 0.75 }
      ],
      bins: [0.5, 0.3, 0.7],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Difference);
    const expectedResult = {
      bounds: { lower: closeTo(0.3), upper: closeTo(0.5) },
      overall: closeTo(0.4)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate difference with 3+ groups correctly (with all overlap)", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.45, upper: 0.7 },
        { lower: 0.25, upper: 0.55 },
        { lower: 0.45, upper: 0.75 }
      ],
      bins: [0.5, 0.3, 0.7],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Difference);
    const expectedResult = {
      bounds: { lower: closeTo(0), upper: closeTo(0.5) },
      overall: closeTo(0.4)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should handle difference case with large binBound that provides the largest and smallest bounds", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.1, upper: 0.3 },
        { lower: 0.7, upper: 0.9 },
        { lower: 0.08, upper: 0.95 }
      ],
      bins: [0.2, 0.8, 0.5],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Difference);
    const expectedResult = {
      // from the 1st and 2nd point: the lower bound = 0.7 - 0.3 = 0.4
      // from the 1st and 3rd point: the upper bound = 0.95 - 0.1 = 0.85
      // the largest difference between nominal bins: overall = 0.8 - 0.2 = 0.6
      bounds: { lower: closeTo(0.4), upper: closeTo(0.85) },
      overall: closeTo(0.6)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate ratio without binBounds correctly", () => {
    const mockValue = {
      bins: [0.5, 0.2],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Ratio);
    const expectedResult = {
      overall: 0.4
    };
    expect(result).toEqual(expectedResult);
  });
  it("should calculate ratio (with overlap) correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.25, upper: 0.6 },
        { lower: 0.4, upper: 0.75 }
      ],
      bins: [0.35, 0.7],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Ratio);
    const expectedResult = {
      bounds: { lower: closeTo(0.33), upper: 1 },
      overall: closeTo(0.5)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate ratio (with overlap and reverse order) correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.4, upper: 0.75 },
        { lower: 0.25, upper: 0.6 }
      ],
      bins: [0.7, 0.35],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Ratio);
    const expectedResult = {
      bounds: { lower: closeTo(0.33), upper: 1 },
      overall: closeTo(0.5)
    };
    expect(result).toMatchObject(expectedResult);
  });
});
