// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  INumericRange,
  ICategoricalRange,
  RangeTypes
} from "@responsible-ai/mlchartlib";
import _ from "lodash";

import { IBinnedResponse } from "./IBinnedResponse";

export class BinnedResponseBuilder {
  private static readonly UpperBoundUniqueIntegers = 10;
  public static buildCategorical(
    featureRange: INumericRange | ICategoricalRange,
    index: number,
    sensitiveFeatures: any[][]
  ): IBinnedResponse {
    if (featureRange.rangeType === RangeTypes.Categorical) {
      return {
        array: (featureRange as ICategoricalRange).uniqueValues,
        featureIndex: index,
        hasError: false,
        labelArray: (featureRange as ICategoricalRange).uniqueValues,
        rangeType: RangeTypes.Categorical
      };
    }
    const uniqueValues = BinnedResponseBuilder.getIntegerUniqueValues(
      sensitiveFeatures,
      index
    );
    return {
      array: uniqueValues,
      featureIndex: index,
      hasError: false,
      labelArray: uniqueValues.map((num) => num.toString()),
      rangeType: RangeTypes.Categorical
    };
  }

  public static buildNumeric(
    featureRange: INumericRange,
    index: number,
    sensitiveFeatures: any[][],
    binCountIn?: number
  ): IBinnedResponse {
    let binCount: number;
    if (binCountIn === undefined) {
      if (featureRange.rangeType === RangeTypes.Integer) {
        const uniqueValues = BinnedResponseBuilder.getIntegerUniqueValues(
          sensitiveFeatures,
          index
        );
        binCount = Math.min(5, uniqueValues.length);
      } else {
        binCount = 5;
      }
    } else {
      binCount = binCountIn;
    }
    const delta = featureRange.max - featureRange.min;
    if (delta === 0 || binCount === 0) {
      return {
        array: [featureRange.max],
        featureIndex: index,
        hasError: false,
        labelArray: [featureRange.max.toString()],
        rangeType: RangeTypes.Categorical
      };
    }
    // make uniform bins in these cases
    if (featureRange.rangeType === RangeTypes.Numeric || delta < binCount - 1) {
      const binDelta = delta / binCount;
      const array = new Array(binCount).fill(0).map((_, index) => {
        return index !== binCount - 1
          ? featureRange.min + binDelta * (1 + index)
          : featureRange.max;
      });
      let prevMax = featureRange.min;
      const labelArray = array.map((num) => {
        const label = `${prevMax.toLocaleString(undefined, {
          maximumSignificantDigits: 3
        })} - ${num.toLocaleString(undefined, {
          maximumSignificantDigits: 3
        })}`;
        prevMax = num;
        return label;
      });
      return {
        array,
        featureIndex: index,
        hasError: false,
        labelArray,
        rangeType: RangeTypes.Numeric
      };
    }
    // handle integer case, increment delta since we include the ends as discrete values
    const intDelta = delta / binCount;
    const array = new Array(binCount).fill(0).map((_, index) => {
      if (index === binCount - 1) {
        return featureRange.max;
      }
      return Math.ceil(featureRange.min - 1 + intDelta * (index + 1));
    });
    let previousVal = featureRange.min;
    const labelArray = array.map((num) => {
      const label =
        previousVal === num
          ? previousVal.toLocaleString(undefined, {
              maximumSignificantDigits: 3
            })
          : `${previousVal.toLocaleString(undefined, {
              maximumSignificantDigits: 3
            })} - ${num.toLocaleString(undefined, {
              maximumSignificantDigits: 3
            })}`;
      previousVal = num + 1;
      return label;
    });
    return {
      array,
      featureIndex: index,
      hasError: false,
      labelArray,
      rangeType: RangeTypes.Integer
    };
  }

  public static buildDefaultBin(
    featureRange: INumericRange | ICategoricalRange,
    index: number,
    sensitiveFeatures: any[][]
  ): IBinnedResponse {
    if (featureRange.rangeType === RangeTypes.Categorical) {
      return BinnedResponseBuilder.buildCategorical(
        featureRange,
        index,
        sensitiveFeatures
      );
    }
    if (featureRange.rangeType === RangeTypes.Integer) {
      const uniqueValues = BinnedResponseBuilder.getIntegerUniqueValues(
        sensitiveFeatures,
        index
      );
      if (
        uniqueValues.length <= BinnedResponseBuilder.UpperBoundUniqueIntegers
      ) {
        return BinnedResponseBuilder.buildCategorical(
          featureRange,
          index,
          sensitiveFeatures
        );
      }
    }
    return BinnedResponseBuilder.buildNumeric(
      featureRange,
      index,
      sensitiveFeatures
    );
  }

  private static getIntegerUniqueValues(
    sensitiveFeatures: any[][],
    index: number
  ): number[] {
    const column = sensitiveFeatures.map((row) => row[index]) as number[];
    return _.uniq(column).sort((a, b) => {
      return a - b;
    });
  }
}
