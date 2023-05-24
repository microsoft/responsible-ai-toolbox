// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RangeTypes } from "@responsible-ai/mlchartlib";

import { Cohort } from "../Cohort/Cohort";
import { ErrorCohort } from "../Cohort/ErrorCohort";
import { IExplanationModelMetadata } from "../Interfaces/IExplanationContext";

import {
  calculateBoxPlotData,
  calculateBoxPlotDataFromErrorCohort,
  calculateBoxPlotDataFromSDK,
  getPercentile
} from "./calculateBoxData";
import { JointDataset } from "./JointDataset";
import { ColumnCategories } from "./JointDatasetUtils";

let mockRequestBoxPlotDistribution: jest.Mock;
const featureIsCategorical = [
  false,
  false,
  false,
  true,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false
];
const modelMetadata = {
  classNames: ["Class 0"],
  featureIsCategorical,
  featureNames: [],
  featureNamesAbridged: [],
  featureRanges: [],
  modelType: "binary"
} as IExplanationModelMetadata;
const jointDataset = new JointDataset({
  dataset: [],
  metadata: modelMetadata
});
jointDataset.metaDict = {
  Age: {
    abbridgedLabel: "age",
    category: ColumnCategories.Dataset,
    featureRange: { max: 64, min: 18, rangeType: RangeTypes.Integer },
    index: 0,
    isCategorical: false,
    label: "age"
  },
  ClassificationOutcome: {
    abbridgedLabel: "Classification outcome",
    category: ColumnCategories.Outcome,
    isCategorical: true,
    label: "Classification outcome",
    sortedCategoricalValues: [
      "True negative",
      "False positive",
      "False negative",
      "True positive"
    ],
    treatAsCategorical: true
  },
  Index: {
    abbridgedLabel: "Index",
    category: ColumnCategories.Index,
    featureRange: { max: 47, min: 0, rangeType: RangeTypes.Integer },
    isCategorical: false,
    label: "Index"
  },
  PredictedY: {
    abbridgedLabel: "Predicted Y",
    category: ColumnCategories.Outcome,
    isCategorical: true,
    label: "Predicted Y",
    sortedCategoricalValues: ["<=50K", ">50K"],
    treatAsCategorical: true
  },
  TrueY: {
    abbridgedLabel: "True Y",
    category: ColumnCategories.Outcome,
    isCategorical: true,
    label: "True Y",
    sortedCategoricalValues: ["<=50K", ">50K"],
    treatAsCategorical: true
  }
};

describe("calculateBoxPlotDataFromErrorCohort", () => {
  it.each`
    filters                                                                                                | expectedResult
    ${[]}                                                                                                  | ${{ high: 0, low: 0, median: 0, q1: 0, q3: 0 }}
    ${[{ arg: [62], column: "Age", method: "less" }]}                                                      | ${{ high: 1, low: 1, median: 1, q1: 1, q3: 1 }}
    ${[{ arg: [62], column: "Age", method: "less" }, { arg: [6], column: "Index", method: "less" }]}       | ${{ high: 100000, low: 100000, median: 100000, q1: 100000, q3: 100000 }}
    ${[{ arg: [6], column: "Index", method: "less" }]}                                                     | ${{ high: 1, low: 0, median: 0.5, q1: 0, q3: 1 }}
    ${[{ arg: [1], column: "PredictedY", method: "includes" }]}                                            | ${{ high: 1, low: 0, median: 0.5, q1: 0, q3: 1 }}
    ${[{ arg: [0], column: "TrueY", method: "includes" }]}                                                 | ${{ high: 2, low: 0, median: 1, q1: 0, q3: 2 }}
    ${[{ arg: ["True negative", "False positive"], column: "ClassificationOutcome", method: "includes" }]} | ${{ high: 10, low: -10, median: 0, q1: -5, q3: 5 }}
  `(
    "should return correct box values from SDK",
    async ({ filters, expectedResult }) => {
      mockRequestBoxPlotDistribution = jest
        .fn()
        .mockReturnValue(expectedResult);
      const boxPlotData = await calculateBoxPlotDataFromErrorCohort(
        new ErrorCohort(
          new Cohort(
            "Cohort Classification outcome",
            jointDataset,
            filters,
            []
          ),
          jointDataset
        ),
        0,
        "",
        "0",
        mockRequestBoxPlotDistribution,
        true
      );
      expect(boxPlotData?.high).toEqual(expectedResult.high);
      expect(boxPlotData?.q3).toEqual(expectedResult.q3);
      expect(boxPlotData?.median).toEqual(expectedResult.median);
      expect(boxPlotData?.q1).toEqual(expectedResult.q1);
      expect(boxPlotData?.low).toEqual(expectedResult.low);
      expect(mockRequestBoxPlotDistribution).toHaveBeenCalled();
    }
  );

  it.each`
    filters                                                                                                | expectedResult
    ${[]}                                                                                                  | ${{ high: 0, low: 0, median: 0, q1: 0, q3: 0 }}
    ${[{ arg: [62], column: "Age", method: "less" }]}                                                      | ${{ high: 1, low: 1, median: 1, q1: 1, q3: 1 }}
    ${[{ arg: [62], column: "Age", method: "less" }, { arg: [6], column: "Index", method: "less" }]}       | ${{ high: 100000, low: 100000, median: 100000, q1: 100000, q3: 100000 }}
    ${[{ arg: [6], column: "Index", method: "less" }]}                                                     | ${{ high: 1, low: 0, median: 0.5, q1: 0, q3: 1 }}
    ${[{ arg: [1], column: "PredictedY", method: "includes" }]}                                            | ${{ high: 1, low: 0, median: 0.5, q1: 0, q3: 1 }}
    ${[{ arg: [0], column: "TrueY", method: "includes" }]}                                                 | ${{ high: 2, low: 0, median: 1, q1: 0, q3: 2 }}
    ${[{ arg: ["True negative", "False positive"], column: "ClassificationOutcome", method: "includes" }]} | ${{ high: 10, low: -10, median: 0, q1: -5, q3: 5 }}
  `(
    "should return correct box values from UI when requestBoxPlotDistribution is undefined",
    async ({ filters, expectedResult }) => {
      mockRequestBoxPlotDistribution = jest
        .fn()
        .mockReturnValue(expectedResult);
      const cohort = new Cohort(
        "Cohort Classification outcome",
        jointDataset,
        filters,
        []
      );
      cohort.filteredData = [
        {
          Age: 67,
          ClassificationOutcome: 3,
          Index: 0,
          PredictedY: 1,
          ProbabilityClass0: 0.7510962272030672,
          TrueY: 1
        }
      ];
      const boxPlotData = await calculateBoxPlotDataFromErrorCohort(
        new ErrorCohort(cohort, jointDataset),
        0,
        "ProbabilityClass0"
      );
      expect(boxPlotData).toBeDefined();
      expect(mockRequestBoxPlotDistribution).not.toHaveBeenCalled();
    }
  );
});

describe("calculateBoxPlotDataFromSDK", () => {
  it.each`
    filters                                                                                                | expectedResult
    ${[]}                                                                                                  | ${{ high: 0, low: 0, median: 0, q1: 0, q3: 0 }}
    ${[{ arg: [62], column: "Age", method: "less" }]}                                                      | ${{ high: 1, low: 1, median: 1, q1: 1, q3: 1 }}
    ${[{ arg: [62], column: "Age", method: "less" }, { arg: [6], column: "Index", method: "less" }]}       | ${{ high: 100000, low: 100000, median: 100000, q1: 100000, q3: 100000 }}
    ${[{ arg: [6], column: "Index", method: "less" }]}                                                     | ${{ high: 1, low: 0, median: 0.5, q1: 0, q3: 1 }}
    ${[{ arg: [1], column: "PredictedY", method: "includes" }]}                                            | ${{ high: 1, low: 0, median: 0.5, q1: 0, q3: 1 }}
    ${[{ arg: [0], column: "TrueY", method: "includes" }]}                                                 | ${{ high: 2, low: 0, median: 1, q1: 0, q3: 2 }}
    ${[{ arg: ["True negative", "False positive"], column: "ClassificationOutcome", method: "includes" }]} | ${{ high: 10, low: -10, median: 0, q1: -5, q3: 5 }}
  `(
    "should return correct box values from SDK",
    async ({ filters, expectedResult }) => {
      mockRequestBoxPlotDistribution = jest
        .fn()
        .mockReturnValue(expectedResult);
      const boxPlotData = await calculateBoxPlotDataFromSDK(
        new ErrorCohort(
          new Cohort(
            "Cohort Classification outcome",
            jointDataset,
            filters,
            []
          ),
          jointDataset
        ),
        mockRequestBoxPlotDistribution,
        "0"
      );
      expect(boxPlotData.high).toEqual(expectedResult.high);
      expect(boxPlotData.q3).toEqual(expectedResult.q3);
      expect(boxPlotData.median).toEqual(expectedResult.median);
      expect(boxPlotData.q1).toEqual(expectedResult.q1);
      expect(boxPlotData.low).toEqual(expectedResult.low);
    }
  );
});

describe("calculateBoxPlot", () => {
  it.each`
    input                      | expectedResult
    ${[0]}                     | ${{ high: 0, low: 0, median: 0, q1: 0, q3: 0 }}
    ${[1]}                     | ${{ high: 1, low: 1, median: 1, q1: 1, q3: 1 }}
    ${[100000]}                | ${{ high: 100000, low: 100000, median: 100000, q1: 100000, q3: 100000 }}
    ${[0, 1]}                  | ${{ high: 1, low: 0, median: 0.5, q1: 0, q3: 1 }}
    ${[1, 0]}                  | ${{ high: 1, low: 0, median: 0.5, q1: 0, q3: 1 }}
    ${[1, 0, 2]}               | ${{ high: 2, low: 0, median: 1, q1: 0, q3: 2 }}
    ${[10, 5, -10, -5, 2, -2]} | ${{ high: 10, low: -10, median: 0, q1: -5, q3: 5 }}
  `("should return correct box values", ({ input, expectedResult }) => {
    const boxPlotData = calculateBoxPlotData(input);
    expect(boxPlotData?.high).toEqual(expectedResult.high);
    expect(boxPlotData?.q3).toEqual(expectedResult.q3);
    expect(boxPlotData?.median).toEqual(expectedResult.median);
    expect(boxPlotData?.q1).toEqual(expectedResult.q1);
    expect(boxPlotData?.low).toEqual(expectedResult.low);
  });
});

describe("calculateBoxPlotEmptyArray", () => {
  it("should return undefined", () => {
    expect(calculateBoxPlotData([])).toBe(undefined);
  });
});

describe("calculateBoxPlotWithIndex", () => {
  it("should return index as x", () => {
    const index = 15;
    expect(calculateBoxPlotData([1], index)?.x).toBe(index);
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
