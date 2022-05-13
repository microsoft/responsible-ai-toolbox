// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";

import { ICategoricalRange } from "./ICategoricalRange";
import { INumericRange } from "./INumericRange";
import { RangeTypes } from "./RangeTypes";

export class ModelMetadata {
  public static buildFeatureRanges(
    testData: any[][],
    isCategoricalArray: boolean[],
    categoricalMap?: { [key: number]: string[] }
  ): Array<INumericRange | ICategoricalRange>;
  public static buildFeatureRanges(
    testData: any[][] | undefined,
    isCategoricalArray: boolean[] | undefined,
    categoricalMap?: { [key: number]: string[] }
  ): Array<INumericRange | ICategoricalRange> | undefined;
  public static buildFeatureRanges(
    testData: any[][] | undefined,
    isCategoricalArray: boolean[] | undefined,
    categoricalMap?: { [key: number]: string[] }
  ): Array<INumericRange | ICategoricalRange> | undefined {
    if (testData === undefined || isCategoricalArray === undefined) {
      return undefined;
    }
    return isCategoricalArray.map((isCategorical, featureIndex) => {
      if (isCategorical) {
        if (categoricalMap && categoricalMap[featureIndex] !== undefined) {
          return {
            rangeType: RangeTypes.Categorical,
            uniqueValues: categoricalMap[featureIndex]
          } as ICategoricalRange;
        }
        const featureVector = testData.map((row) => row[featureIndex]);
        return {
          rangeType: RangeTypes.Categorical,
          uniqueValues: _.uniq(featureVector)
        } as ICategoricalRange;
      }
      const featureVector = testData.map((row) => row[featureIndex]);
      return {
        max: _.max(featureVector) || 0,
        min: _.min(featureVector) || 0,
        rangeType: featureVector.every((val) => Number.isInteger(val))
          ? RangeTypes.Integer
          : RangeTypes.Numeric
      } as INumericRange;
    });
  }

  public static buildIsCategorical(
    featureLength: number,
    testData: any[][] | undefined,
    categoricalMap?: { [key: number]: string[] }
  ): boolean[];
  public static buildIsCategorical(
    featureLength: number,
    testData?: any[][],
    categoricalMap?: { [key: number]: string[] }
  ): boolean[] | undefined {
    const featureIndexArray = [...new Array(featureLength).keys()];
    if (categoricalMap) {
      return featureIndexArray.map((i) => categoricalMap[i] !== undefined);
    }
    if (testData) {
      return featureIndexArray.map((featureIndex) => {
        return !testData.every((row) => typeof row[featureIndex] === "number");
      });
    }
    return undefined;
  }
}
