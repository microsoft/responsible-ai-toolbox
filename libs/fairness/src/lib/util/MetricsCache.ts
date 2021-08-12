// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IMetricResponse,
  IMetricRequest,
  IFairnessResponse
} from "@responsible-ai/core-ui";
import _, { max, min } from "lodash";

import { FairnessModes, fairnessOptions } from "./FairnessMetrics";

export class MetricsCache {
  // Top index is featureBin index, second index is model index. Third string key is metricKey
  private cache: Array<Array<{ [key: string]: IMetricResponse }>>;
  public constructor(
    private featureCount: number,
    private numberOfModels: number,
    private fetchMethod?: (request: IMetricRequest) => Promise<IMetricResponse>,
    precomputedCache?: Array<Array<{ [key: string]: IMetricResponse }>>
  ) {
    if (precomputedCache) {
      this.cache = precomputedCache;
    } else {
      this.cache = new Array(featureCount).fill(0).map(() =>
        new Array(numberOfModels).fill(0).map(() => {
          return {};
        })
      );
    }
  }

  public async getMetric(
    binIndexVector: number[],
    featureIndex: number,
    modelIndex: number,
    key: string,
    errorKey: string
  ): Promise<IMetricResponse> {
    let value = this.cache[featureIndex][modelIndex][key];
    if (
      (!value || (!value.bounds && errorKey !== "disabled")) &&
      this.fetchMethod
    ) {
      value = await this.fetchMethod({
        binVector: binIndexVector,
        errorKey,
        metricKey: key,
        modelIndex
      });
      this.cache[featureIndex][modelIndex][key] = value;
    }
    return this.cache[featureIndex][modelIndex][key];
  }

  public async getEqualizedOdds(
    binIndexVector: number[],
    featureIndex: number,
    modelIndex: number,
    fairnessMethod: FairnessModes,
    errorKey: string
  ): Promise<IFairnessResponse> {
    const falsePositiveRateMetric = (
      await this.getFairnessMetric(
        binIndexVector,
        featureIndex,
        modelIndex,
        fairnessMethod === FairnessModes.Difference
          ? "false_positive_rate_difference"
          : "false_positive_rate_ratio",
        fairnessMethod,
        errorKey
      )
    ).overall;
    const truePositiveRateMetric = (
      await this.getFairnessMetric(
        binIndexVector,
        featureIndex,
        modelIndex,
        fairnessMethod === FairnessModes.Difference
          ? "true_positive_rate_difference"
          : "true_positive_rate_ratio",
        fairnessMethod,
        errorKey
      )
    ).overall;

    if (
      falsePositiveRateMetric === Number.NaN ||
      truePositiveRateMetric === Number.NaN
    ) {
      return { overall: Number.NaN };
    }

    if (fairnessMethod === FairnessModes.Difference) {
      const maxMetric = max([falsePositiveRateMetric, truePositiveRateMetric]);
      return { overall: maxMetric ?? Number.NaN };
    }

    // assumes FairnessModes.Ratio
    const minMetric = min([falsePositiveRateMetric, truePositiveRateMetric]);
    return { overall: minMetric ?? Number.NaN };
  }

  public async getFairnessMetric(
    binIndexVector: number[],
    featureIndex: number,
    modelIndex: number,
    key: string,
    fairnessMethod: FairnessModes,
    errorKey: string
  ): Promise<IFairnessResponse> {
    // Equalized Odds is calculated based on two other fairness metrics.
    if (key.startsWith("equalized_odds")) {
      return this.getEqualizedOdds(
        binIndexVector,
        featureIndex,
        modelIndex,
        fairnessMethod,
        errorKey
      );
    }

    const metricKey = fairnessOptions[key].fairnessMetric;
    let value = this.cache[featureIndex][modelIndex][metricKey];
    if (
      (!value || (!value.bounds && errorKey !== "disabled")) &&
      this.fetchMethod
    ) {
      value = await this.fetchMethod({
        binVector: binIndexVector,
        errorKey,
        metricKey,
        modelIndex
      });
      this.cache[featureIndex][modelIndex][metricKey] = value;
    }
    if (!value || !value?.bins) {
      return { overall: Number.NaN };
    }

    let response;
    let binBounds;
    let lowerBounds;
    let upperBounds;
    let minLowerBound;
    let maxLowerBound;
    let minUpperBound;
    let maxUpperBound;

    let bins = value.bins
      .slice()
      .filter((x) => x !== undefined && !Number.isNaN(x) && !_.isArray(x[0])); // filters out confidence bounds

    // convert from object to array (assumes first array is the metric)
    if (typeof bins[0] === "object") {
      bins = _.values(bins[0]);
    }

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

      lowerBounds = binBounds
        ? value?.binBounds.map((binBound) => {
            return binBound.lower;
          })
        : undefined;
      upperBounds = binBounds
        ? value?.binBounds.map((binBound) => {
            return binBound.upper;
          })
        : undefined;
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
      response = { overall: min };
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

    if (fairnessMethod === FairnessModes.Ratio) {
      if (binBounds && binBounds.length > 1) {
        let minRatio = Infinity;
        let maxRatio = -Infinity;
        for (let i = 0; i < binBounds.length - 1; i++) {
          for (let j = 1; j < binBounds.length; j++) {
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

              if (minCandidate < 0) {
                console.log(minDiff);
              }

              minDiff = minCandidate < minDiff ? minCandidate : minDiff;
              maxDiff = maxCandidate > maxDiff ? maxCandidate : maxDiff;
            }
          }
        }
        if (minDiff < 0) {
          console.log(minDiff);
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

  public async getFairnessMetricV1(
    binIndexVector: number[],
    featureIndex: number,
    modelIndex: number,
    key: string,
    fairnessMethod: FairnessModes
  ): Promise<number> {
    let value = this.cache[featureIndex][modelIndex][key];
    if (!value && this.fetchMethod) {
      value = await this.fetchMethod({
        binVector: binIndexVector,
        metricKey: key,
        modelIndex
      });
      this.cache[featureIndex][modelIndex][key] = value;
    }
    if (!value?.bins) {
      return Number.NaN;
    }

    const bins = value.bins
      .slice()
      .filter((x) => x !== undefined && !Number.isNaN(x));

    const min = _.min(bins);
    const max = _.max(bins);
    if (
      min === undefined ||
      max === undefined ||
      (max === 0 && fairnessMethod === FairnessModes.Ratio)
    ) {
      return Number.NaN;
    }
    return fairnessMethod === FairnessModes.Difference ? max - min : min / max;
  }

  public clearCache(binIndex?: number): void {
    if (binIndex !== undefined) {
      this.cache[binIndex] = new Array(this.numberOfModels).fill(0).map(() => {
        return {};
      });
    } else {
      this.cache = new Array(this.featureCount).fill(0).map(() =>
        new Array(this.numberOfModels).fill(0).map(() => {
          return {};
        })
      );
    }
  }
}
