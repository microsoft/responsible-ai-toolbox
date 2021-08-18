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
      let lowerRatio = Infinity;
      let upperRatio = Infinity;
      for (let i = 0; i < binBounds.length - 1; i++) {
        for (let j = i + 1; j < binBounds.length; j++) {
          let lowerCandidate;
          let upperCandidate;

          // if there is overlap
          if (
            binBounds[i].upper > binBounds[j].lower &&
            binBounds[j].upper > binBounds[i].lower
          ) {
            const lowerCandidate1 = binBounds[i].lower / binBounds[j].upper;
            const lowerCandidate2 = binBounds[j].lower / binBounds[i].upper;
            const lowerCandidate =
              lowerCandidate1 < lowerCandidate2
                ? lowerCandidate1
                : lowerCandidate2;

            // for ratio, we want smallest lower and upper bounds
            lowerRatio =
              lowerCandidate < lowerRatio ? lowerCandidate : lowerRatio;
            upperRatio = 1 < upperRatio ? 1 : upperRatio;
          } else {
            // index i is completely greater than j
            if (binBounds[i].upper > binBounds[j].upper) {
              lowerCandidate = binBounds[j].lower / binBounds[i].upper;
              upperCandidate = binBounds[j].upper / binBounds[i].lower;
            } else {
              lowerCandidate = binBounds[i].lower / binBounds[j].upper;
              upperCandidate = binBounds[i].upper / binBounds[j].lower;
            }

            // for ratio, we want smallest lower and upper bounds
            lowerRatio =
              lowerCandidate < lowerRatio ? lowerCandidate : lowerRatio;
            upperRatio =
              upperCandidate < upperRatio ? upperCandidate : upperRatio;
          }
        }
      }
      return {
        bounds: {
          lower: lowerRatio,
          upper: upperRatio
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
      let lowerDiff = -Infinity;
      let upperDiff = -Infinity;
      for (let i = 0; i < binBounds.length - 1; i++) {
        for (let j = i + 1; j < binBounds.length; j++) {
          let lowerCandidate;
          let upperCandidate;

          // if there is overlap
          if (
            binBounds[i].upper > binBounds[j].lower &&
            binBounds[j].upper > binBounds[i].lower
          ) {
            const upperCandidate1 = Math.abs(
              binBounds[j].upper - binBounds[i].lower
            );
            const upperCandidate2 = Math.abs(
              binBounds[i].upper - binBounds[j].lower
            );
            upperCandidate =
              upperCandidate1 > upperCandidate2
                ? upperCandidate1
                : upperCandidate2;

            // for difference, we want largest lower and upper bounds
            lowerDiff = 0 > lowerDiff ? 0 : lowerDiff;
            upperDiff = upperCandidate > upperDiff ? upperCandidate : upperDiff;
          } else {
            // index i is completely greater than j
            if (binBounds[i].upper > binBounds[j].upper) {
              lowerCandidate = binBounds[i].lower - binBounds[j].upper;
              upperCandidate = binBounds[i].upper - binBounds[j].lower;
            } else {
              lowerCandidate = binBounds[j].lower - binBounds[i].upper;
              upperCandidate = binBounds[j].upper - binBounds[i].lower;
            }

            // for difference, we want largest lower and upper bounds
            lowerDiff = lowerCandidate > lowerDiff ? lowerCandidate : lowerDiff;
            upperDiff = upperCandidate > upperDiff ? upperCandidate : upperDiff;
          }
        }
      }
      return {
        bounds: {
          lower: lowerDiff,
          upper: upperDiff
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
