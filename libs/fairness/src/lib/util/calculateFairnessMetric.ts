// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IMetricResponse } from "@responsible-ai/core-ui";
import _ from "lodash";

import { FairnessModes } from "./FairnessMetrics";

export function calculateFairnessMetric(
  value: IMetricResponse,
  fairnessMethod: FairnessModes
) {
  let response;
  let binBounds;
  let lowerBounds;
  let upperBounds;
  let minLowerBound;
  let maxLowerBound;
  let minUpperBound;
  let maxUpperBound;

  const bins = value.bins
    .slice()
    .filter((x) => x !== undefined && !Number.isNaN(x) && !_.isArray(x[0])); // filters out confidence bounds

  const min = _.min(bins);
  const max = _.max(bins);

  if (min === undefined || max === undefined) {
    return { overall: Number.NaN };
  }

  // Use confidence bounds for each bin if they exist
  if (value?.binBounds) {
    binBounds = value.binBounds
      .slice()
      .filter((x) => x !== undefined && !Number.isNaN(x));

    lowerBounds = value?.binBounds.map((binBound) => {
      return binBound.lower;
    });
    upperBounds = value?.binBounds.map((binBound) => {
      return binBound.upper;
    });
    minLowerBound = _.min(lowerBounds);
    maxLowerBound = _.max(lowerBounds);
    minUpperBound = _.min(upperBounds);
    maxUpperBound = _.max(upperBounds);
  }

  if (fairnessMethod === FairnessModes.Min) {
    response = { overall: min };
    if (minLowerBound && minUpperBound) {
      response = {
        ...response,
        bounds: {
          lower: minLowerBound,
          upper: minUpperBound
        }
      };
    }
    return response;
  }

  if (fairnessMethod === FairnessModes.Max) {
    response = { overall: max };
    if (maxLowerBound && maxUpperBound) {
      response = {
        ...response,
        bounds: {
          lower: maxLowerBound,
          upper: maxUpperBound
        }
      };
    }
    return response;
  }
  // Note: The `bounds` of this Ratio metric looks at all
  // disaggregated bounds, even if those disaggregated bounds are not
  // the bounds of the nominal extremes that contribute to the
  // `overall` property of the Ratio
  if (fairnessMethod === FairnessModes.Ratio) {
    if (binBounds && binBounds.length > 1) {
      let minRatio = Infinity;
      let maxRatio = -Infinity;
      for (let i = 0; i < binBounds.length - 1; i++) {
        for (let j = i + 1; j < binBounds.length; j++) {
          let minCandidate;
          let maxCandidate;

          // if there is overlap
          if (
            binBounds[i].upper > binBounds[j].lower &&
            binBounds[j].upper > binBounds[i].lower
          ) {
            const minCandidate1 = binBounds[i].lower / binBounds[j].upper;
            const minCandidate2 = binBounds[j].lower / binBounds[i].upper;
            const minCandidate =
              minCandidate1 < minCandidate2 ? minCandidate1 : minCandidate2;

            minRatio = minCandidate < minRatio ? minCandidate : minRatio;
            maxRatio = 1;
          } else {
            // index i is completely greater than j
            if (binBounds[i].upper > binBounds[j].upper) {
              minCandidate = binBounds[j].lower / binBounds[i].upper;
              maxCandidate = binBounds[j].upper / binBounds[i].lower;
            } else {
              minCandidate = binBounds[i].lower / binBounds[j].upper;
              maxCandidate = binBounds[i].upper / binBounds[j].lower;
            }

            minRatio = minCandidate < minRatio ? minCandidate : minRatio;
            maxRatio = maxCandidate > maxRatio ? maxCandidate : maxRatio;
          }
        }
      }
      return {
        bounds: {
          lower: minRatio,
          upper: maxRatio
        },
        overall: min / max
      };
    }
    return {
      overall: min / max
    };
  }
  // Note: The `bounds` of this Difference metric looks at all
  // disaggregated bounds, even if those disaggregated bounds are not
  // the bounds of the nominal extremes that contribute to the
  // `overall` property of the Difference
  if (fairnessMethod === FairnessModes.Difference) {
    if (binBounds && binBounds.length > 1) {
      let minDiff = Infinity;
      let maxDiff = -Infinity;
      for (let i = 0; i < binBounds.length - 1; i++) {
        for (let j = i + 1; j < binBounds.length; j++) {
          let minCandidate;
          let maxCandidate;

          // if there is overlap
          if (
            binBounds[i].upper > binBounds[j].lower &&
            binBounds[j].upper > binBounds[i].lower
          ) {
            const maxCandidate1 = Math.abs(
              binBounds[j].upper - binBounds[i].lower
            );
            const maxCandidate2 = Math.abs(
              binBounds[i].upper - binBounds[j].lower
            );
            maxCandidate =
              maxCandidate1 > maxCandidate2 ? maxCandidate1 : maxCandidate2;

            minDiff = 0;
            maxDiff = maxCandidate > maxDiff ? maxCandidate : maxDiff;
          } else {
            // index i is completely greater than j
            if (binBounds[i].upper > binBounds[j].upper) {
              minCandidate = binBounds[i].lower - binBounds[j].upper;
              maxCandidate = binBounds[i].upper - binBounds[j].lower;
            } else {
              minCandidate = binBounds[j].lower - binBounds[i].upper;
              maxCandidate = binBounds[j].upper - binBounds[i].lower;
            }

            minDiff = minCandidate < minDiff ? minCandidate : minDiff;
            maxDiff = maxCandidate > maxDiff ? maxCandidate : maxDiff;
          }
        }
      }
      return {
        bounds: {
          lower: minDiff,
          upper: maxDiff
        },
        overall: max - min
      };
    }
    return {
      overall: max - min
    };
  }
  return { overall: Number.NaN };
}
