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
  it("should calculate ratio (with complete overlap) correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.2, upper: 0.8 },
        { lower: 0.5, upper: 0.7 }
      ],
      bins: [0.5, 0.6],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Ratio);
    const expectedResult = {
      bounds: { lower: closeTo(0.29), upper: 1 },
      overall: closeTo(0.83)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate ratio (with complete overlap and reversed order) correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.5, upper: 0.7 },
        { lower: 0.2, upper: 0.8 }
      ],
      bins: [0.5, 0.6],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Ratio);
    const expectedResult = {
      bounds: { lower: closeTo(0.29), upper: 1 },
      overall: closeTo(0.83)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate ratio (without overlap) correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.25, upper: 0.4 },
        { lower: 0.6, upper: 0.75 }
      ],
      bins: [0.35, 0.7],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Ratio);
    const expectedResult = {
      bounds: { lower: closeTo(0.33), upper: closeTo(0.67) },
      overall: closeTo(0.5)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate ratio (without overlap and reverse order) correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.6, upper: 0.75 },
        { lower: 0.25, upper: 0.4 }
      ],
      bins: [0.7, 0.35],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Ratio);
    const expectedResult = {
      bounds: { lower: closeTo(0.33), upper: closeTo(0.67) },
      overall: closeTo(0.5)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate ratio with 3+ groups correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.25, upper: 0.4 },
        { lower: 0.6, upper: 0.75 },
        { lower: 0.45, upper: 0.55 }
      ],
      bins: [0.35, 0.7, 0.5],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Ratio);
    const expectedResult = {
      bounds: { lower: closeTo(0.33), upper: closeTo(0.67) },
      overall: closeTo(0.5)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate ratio with 3+ groups correctly (permuted order)", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.45, upper: 0.55 },
        { lower: 0.25, upper: 0.4 },
        { lower: 0.6, upper: 0.75 }
      ],
      bins: [0.5, 0.35, 0.7],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Ratio);
    const expectedResult = {
      bounds: { lower: closeTo(0.33), upper: closeTo(0.67) },
      overall: closeTo(0.5)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate ratio with 3+ groups correctly (with overlap)", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.45, upper: 0.65 },
        { lower: 0.25, upper: 0.4 },
        { lower: 0.6, upper: 0.75 }
      ],
      bins: [0.5, 0.35, 0.7],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Ratio);
    const expectedResult = {
      bounds: { lower: closeTo(0.33), upper: closeTo(0.67) },
      overall: closeTo(0.5)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate ratio with 3+ groups correctly (with all overlap)", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.45, upper: 0.7 },
        { lower: 0.25, upper: 0.55 },
        { lower: 0.45, upper: 0.75 }
      ],
      bins: [0.5, 0.35, 0.7],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Ratio);
    const expectedResult = {
      bounds: { lower: closeTo(0.33), upper: closeTo(1) },
      overall: closeTo(0.5)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should handle ratio case with large binBound that provides the largest and smallest bounds", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.1, upper: 0.3 },
        { lower: 0.7, upper: 0.9 },
        { lower: 0.08, upper: 0.95 }
      ],
      bins: [0.2, 0.8, 0.5],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Ratio);
    const expectedResult = {
      // from the 1st and 3rd point: the lower bound = 0.08 / 0.9
      // from the 1st and 2nd point: the upper bound = 0.3 / 0.7
      // the smallest ratio between nominal bins: overall = 0.2 / 0.8
      bounds: { lower: closeTo(0.09), upper: closeTo(0.43) },
      overall: closeTo(0.25)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate minimum with no binBounds correctly", () => {
    const mockValue = {
      bins: [0.5, 0.2],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Min);
    const expectedResult = {
      overall: 0.2
    };
    expect(result).toEqual(expectedResult);
  });
  it("should calculate minimum with binBounds correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.25, upper: 0.4 },
        { lower: 0.6, upper: 0.75 }
      ],
      bins: [0.35, 0.7],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Min);
    const expectedResult = {
      bounds: { lower: closeTo(0.25), upper: closeTo(0.4) },
      overall: closeTo(0.35)
    };
    expect(result).toMatchObject(expectedResult);
  });
  it("should calculate maximum with no binBounds correctly", () => {
    const mockValue = {
      bins: [0.5, 0.2],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Max);
    const expectedResult = {
      overall: 0.5
    };
    expect(result).toEqual(expectedResult);
  });
  it("should calculate maximum with binBounds correctly", () => {
    const mockValue = {
      binBounds: [
        { lower: 0.25, upper: 0.4 },
        { lower: 0.6, upper: 0.75 }
      ],
      bins: [0.35, 0.7],
      global: 0.5
    };
    const result = calculateFairnessMetric(mockValue, FairnessModes.Max);
    const expectedResult = {
      bounds: { lower: closeTo(0.6), upper: closeTo(0.75) },
      overall: closeTo(0.7)
    };
    expect(result).toMatchObject(expectedResult);
  });
});
