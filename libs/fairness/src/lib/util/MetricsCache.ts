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
    disparityMethod: ParityModes
  ): Promise<number> {
    const false_positive_rate_metric = await this.getDisparityMetric(
      binIndexVector,
      featureIndex,
      modelIndex,
      disparityMethod === ParityModes.Difference
        ? "false_positive_rate_difference"
        : "false_positive_rate_ratio",
      disparityMethod
    );
    const true_positive_rate_metric = await this.getDisparityMetric(
      binIndexVector,
      featureIndex,
      modelIndex,
      disparityMethod === ParityModes.Difference
        ? "true_positive_rate_difference"
        : "true_positive_rate_ratio",
      disparityMethod
    );

    if (false_positive_rate_metric === Number.NaN || true_positive_rate_metric === Number.NaN){
      return Number.NaN;
    }
    
    if (disparityMethod === ParityModes.Difference){
      let max_metric = max([false_positive_rate_metric, true_positive_rate_metric]);
      return max_metric === undefined ? Number.NaN : max_metric;
    }
    else {
      let min_metric = min([false_positive_rate_metric, true_positive_rate_metric])
      return min_metric === undefined ? Number.NaN : min_metric;
    }
  }

  public async getDisparityMetric(
    binIndexVector: number[],
    featureIndex: number,
    modelIndex: number,
    key: string,
    disparityMethod: ParityModes
  ): Promise<number> {
    // Equalized Odds is calculated based on two other fairness metrics.
    if (key.startsWith("equalized_odds")) {
      return this.getEqualizedOdds(
        binIndexVector,
        featureIndex,
        modelIndex,
        disparityMethod
      );
    }

    const metricKey = parityOptions[key].parityMetric;
    let value = this.cache[featureIndex][modelIndex][metricKey];
    if (value === undefined && this.fetchMethod) {
      value = await this.fetchMethod({
        binVector: binIndexVector,
        metricKey: metricKey,
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
    if (
      min === undefined ||
      max === undefined ||
      (max === 0 && disparityMethod === ParityModes.Ratio)
    ) {
      return Number.NaN;
    }
    return disparityMethod === ParityModes.Difference ? max - min : min / max;
  }

  public async getDisparityMetricV1(
    binIndexVector: number[],
    featureIndex: number,
    modelIndex: number,
    key: string,
    disparityMethod: ParityModes
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
      (max === 0 && disparityMethod === ParityModes.Ratio)
    ) {
      return Number.NaN;
    }
    return disparityMethod === ParityModes.Difference ? max - min : min / max;
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
