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
      (value === undefined || (!value.bounds && errorKey !== "disabled")) &&
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
      return maxMetric === undefined
        ? { overall: Number.NaN }
        : { overall: maxMetric };
    }

    // assumes FairnessModes.Ratio
    const minMetric = min([falsePositiveRateMetric, truePositiveRateMetric]);
    return minMetric === undefined
      ? { overall: Number.NaN }
      : { overall: minMetric };
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
      (value === undefined || (!value.bounds && errorKey !== "disabled")) &&
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
    if (!value?.bins) {
      return { overall: Number.NaN };
    }

    let minLowerBound;
    let maxLowerBound;
    let minUpperBound;
    let maxUpperBound;

    let response;
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
      const binBounds = value.binBounds
        .slice()
        .filter((x) => x !== undefined && !Number.isNaN(x));

      const minIndex = _.indexOf(bins, min, 0);
      const maxIndex = _.indexOf(bins, max, 0);

      minLowerBound = binBounds[minIndex].lower;
      minUpperBound = binBounds[minIndex].upper;

      maxLowerBound = binBounds[maxIndex].lower;
      maxUpperBound = binBounds[maxIndex].upper;
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
      if (max === 0) {
        return { overall: 0 };
      }
      if (maxUpperBound === 0 || maxLowerBound === 0) {
        return { overall: min / max };
      }
      if (minLowerBound && maxLowerBound && minUpperBound && maxUpperBound) {
        return {
          bounds: {
            lower: minLowerBound / maxUpperBound,
            upper: minUpperBound / maxLowerBound
          },
          overall: min / max
        };
      }
    }

    if (fairnessMethod === FairnessModes.Difference) {
      response = { overall: max - min };
      if (minLowerBound && maxLowerBound && minUpperBound && maxUpperBound) {
        const lower = _.max([maxLowerBound - minUpperBound, 0]);
        const upper = _.max([
          minUpperBound - maxLowerBound,
          maxUpperBound - minLowerBound
        ]);

        if (lower !== undefined && upper !== undefined) {
          response = {
            ...response,
            bounds: {
              lower,
              upper
            }
          };
        }
      }
      return response;
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
    if (value === undefined && this.fetchMethod) {
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
