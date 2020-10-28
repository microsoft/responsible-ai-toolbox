// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _, { max, min } from "lodash";

import { IMetricResponse, IMetricRequest } from "../IFairnessProps";

import { ParityModes, parityOptions } from "./ParityMetrics";

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
    key: string
  ): Promise<IMetricResponse> {
    let value = this.cache[featureIndex][modelIndex][key];
    if (value === undefined && this.fetchMethod) {
      value = await this.fetchMethod({
        binVector: binIndexVector,
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
    fairnessMethod: ParityModes
  ): Promise<number> {
    const falsePositiveRateMetric = await this.getFairnessMetric(
      binIndexVector,
      featureIndex,
      modelIndex,
      fairnessMethod === ParityModes.Difference
        ? "false_positive_rate_difference"
        : "false_positive_rate_ratio",
      fairnessMethod
    );
    const truePositiveRateMetric = await this.getFairnessMetric(
      binIndexVector,
      featureIndex,
      modelIndex,
      fairnessMethod === ParityModes.Difference
        ? "true_positive_rate_difference"
        : "true_positive_rate_ratio",
      fairnessMethod
    );

    if (
      falsePositiveRateMetric === Number.NaN ||
      truePositiveRateMetric === Number.NaN
    ) {
      return Number.NaN;
    }

    if (fairnessMethod === ParityModes.Difference) {
      const maxMetric = max([falsePositiveRateMetric, truePositiveRateMetric]);
      return maxMetric === undefined ? Number.NaN : maxMetric;
    }

    const minMetric = min([falsePositiveRateMetric, truePositiveRateMetric]);
    return minMetric === undefined ? Number.NaN : minMetric;
  }

  public async getFairnessMetric(
    binIndexVector: number[],
    featureIndex: number,
    modelIndex: number,
    key: string,
    fairnessMethod: ParityModes
  ): Promise<number> {
    // Equalized Odds is calculated based on two other fairness metrics.
    if (key.startsWith("equalized_odds")) {
      return this.getEqualizedOdds(
        binIndexVector,
        featureIndex,
        modelIndex,
        fairnessMethod
      );
    }

    const metricKey = parityOptions[key].parityMetric;
    let value = this.cache[featureIndex][modelIndex][metricKey];
    if (value === undefined && this.fetchMethod) {
      value = await this.fetchMethod({
        binVector: binIndexVector,
        metricKey,
        modelIndex
      });
      this.cache[featureIndex][modelIndex][metricKey] = value;
    }
    if (!value?.bins) {
      return Number.NaN;
    }

    const bins = value.bins
      .slice()
      .filter((x) => x !== undefined && !Number.isNaN(x));

    const min = _.min(bins);
    const max = _.max(bins);

    if (min === undefined || max === undefined) {
      return Number.NaN;
    }

    if (fairnessMethod === ParityModes.Min) {
      return min;
    }

    if (fairnessMethod === ParityModes.Max) {
      return max;
    }

    if (fairnessMethod === ParityModes.Ratio) {
      if (max === 0) {
        return Number.NaN;
      }
      return min / max;
    }

    if (fairnessMethod === ParityModes.Difference) {
      return max - min;
    }

    return Number.NaN;
  }

  public async getDisparityMetricV1(
    binIndexVector: number[],
    featureIndex: number,
    modelIndex: number,
    key: string,
    fairnessMethod: ParityModes
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
      (max === 0 && fairnessMethod === ParityModes.Ratio)
    ) {
      return Number.NaN;
    }
    return fairnessMethod === ParityModes.Difference ? max - min : min / max;
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
